import { getApiKeys } from "../lib/apiFallback"

const CLOD_API_KEYS = getApiKeys("VITE_CLOD_API_KEY")
const CLOD_API_BASE = "/api/clod/v1"

// ─── Usage tracking (IndexedDB) ──────────────────────────────────────────────

const DB_NAME = "koye_clod_usage"
const DB_VERSION = 1
const STORE_NAME = "usage"

interface UsageRecord {
  id: string // apiKeyHash
  rpm_used: number
  rpd_used: number
  minute_window: number
  day_window: number
}

function hashKey(apiKey: string): string {
  let h = 0
  for (let i = 0; i < apiKey.length; i++) {
    h = ((h << 5) - h + apiKey.charCodeAt(i)) | 0
  }
  return "c" + Math.abs(h).toString(36)
}

let _dbCache: IDBDatabase | null = null
let _dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (_dbCache) {
    try {
      _dbCache.transaction(STORE_NAME, "readonly")
      return Promise.resolve(_dbCache)
    } catch {
      _dbCache = null
    }
  }
  if (_dbPromise) return _dbPromise

  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    request.onsuccess = () => {
      _dbCache = request.result
      _dbPromise = null
      _dbCache.onclose = () => { _dbCache = null }
      resolve(_dbCache)
    }
    request.onerror = () => {
      _dbPromise = null
      reject(request.error)
    }
  })
  return _dbPromise
}

function emptyRecord(id: string): UsageRecord {
  return {
    id,
    rpm_used: 0,
    rpd_used: 0,
    minute_window: 0,
    day_window: 0,
  }
}

async function getUsage(id: string): Promise<UsageRecord> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(id)
    req.onsuccess = () => resolve(req.result ?? emptyRecord(id))
    req.onerror = () => resolve(emptyRecord(id))
  })
}

async function putUsage(record: UsageRecord): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function currentMinuteWindow(): number {
  return Math.floor(Date.now() / 60_000) * 60_000
}

function currentDayWindow(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function refreshWindows(rec: UsageRecord): UsageRecord {
  const mw = currentMinuteWindow()
  const dw = currentDayWindow()
  if (rec.minute_window !== mw) {
    rec.rpm_used = 0
    rec.minute_window = mw
  }
  if (rec.day_window !== dw) {
    rec.rpd_used = 0
    rec.day_window = dw
  }
  return rec
}

// Limits
const LIMIT_RPM = 60
const LIMIT_RPD = 100
const INVALID_KEYS_STORAGE = "koye_clod_invalid_key_hashes"
const INVALID_KEY_TTL_MS = 24 * 60 * 60 * 1000

export class ClodAllKeysDayExhaustedError extends Error {
  constructor() {
    super("ALL_CLOD_KEYS_DAY_EXHAUSTED")
    this.name = "ClodAllKeysDayExhaustedError"
  }
}

export class ClodAllKeysMinuteExhaustedError extends Error {
  constructor() {
    super("ALL_CLOD_KEYS_MINUTE_EXHAUSTED")
    this.name = "ClodAllKeysMinuteExhaustedError"
  }
}

export class ClodAllKeysInvalidError extends Error {
  constructor() {
    super("ALL_CLOD_KEYS_INVALID")
    this.name = "ClodAllKeysInvalidError"
  }
}

function readInvalidKeyHashes(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(INVALID_KEYS_STORAGE)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as Array<{ kh: string; until: number }>
    const now = Date.now()
    const filtered = parsed.filter((x) => x && typeof x.kh === "string" && typeof x.until === "number" && x.until > now)
    if (filtered.length !== parsed.length) {
      localStorage.setItem(INVALID_KEYS_STORAGE, JSON.stringify(filtered))
    }
    return new Set(filtered.map((x) => x.kh))
  } catch {
    return new Set()
  }
}

async function markClodInvalidKey(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return
  const kh = hashKey(apiKey)
  const until = Date.now() + INVALID_KEY_TTL_MS
  try {
    const raw = localStorage.getItem(INVALID_KEYS_STORAGE)
    const parsed = raw ? (JSON.parse(raw) as Array<{ kh: string; until: number }>) : []
    const next = (Array.isArray(parsed) ? parsed : [])
      .filter((x) => x && typeof x.kh === "string" && typeof x.until === "number" && x.until > Date.now() && x.kh !== kh)
    next.push({ kh, until })
    localStorage.setItem(INVALID_KEYS_STORAGE, JSON.stringify(next))
  } catch {
  }
}

function getCandidateKeys(): string[] {
  const invalid = readInvalidKeyHashes()
  const filtered = CLOD_API_KEYS.filter((k) => !invalid.has(hashKey(k)))
  if (filtered.length === 0 && CLOD_API_KEYS.length > 0 && invalid.size > 0 && typeof window !== "undefined") {
    try {
      localStorage.removeItem(INVALID_KEYS_STORAGE)
    } catch {
    }
    return [...CLOD_API_KEYS]
  }
  return filtered
}

async function checkClodAvailabilityInternal(excludedKeyHashes?: Set<string>): Promise<{ apiKey: string; isMinuteLimited: boolean; isDayLimited: boolean }> {
  let allDayLimited = true
  const candidates = getCandidateKeys().filter((k) => !excludedKeyHashes?.has(hashKey(k)))

  if (candidates.length === 0) {
    if (CLOD_API_KEYS.length === 0) {
      throw new Error("CLOD_API_KEY_REQUIRED")
    }
    if (excludedKeyHashes && excludedKeyHashes.size > 0) {
      throw new Error("CLOD_NO_ELIGIBLE_KEYS")
    }
    throw new ClodAllKeysInvalidError()
  }

  for (const apiKey of candidates) {
    const kh = hashKey(apiKey)
    let rec = await getUsage(kh)
    rec = refreshWindows(rec)

    if (rec.rpd_used < LIMIT_RPD) {
      allDayLimited = false
      if (rec.rpm_used < LIMIT_RPM) {
        return { apiKey, isMinuteLimited: false, isDayLimited: false }
      }
    }
  }

  if (allDayLimited) {
    throw new ClodAllKeysDayExhaustedError()
  } else {
    throw new ClodAllKeysMinuteExhaustedError()
  }
}

export async function checkClodAvailability(): Promise<{ apiKey: string; isMinuteLimited: boolean; isDayLimited: boolean }> {
  return checkClodAvailabilityInternal()
}

export async function recordClodUsage(apiKey: string): Promise<void> {
  const kh = hashKey(apiKey)
  let rec = await getUsage(kh)
  rec = refreshWindows(rec)
  rec.rpm_used += 1
  rec.rpd_used += 1
  await putUsage(rec)
}

export async function markClodRateLimited(apiKey: string): Promise<void> {
  const kh = hashKey(apiKey)
  let rec = await getUsage(kh)
  rec = refreshWindows(rec)
  rec.rpm_used = LIMIT_RPM // Saturate minute limit
  await putUsage(rec)
}

// ─── Stream Generation ───────────────────────────────────────────────────────

export interface ClodMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function* sendMessageToClodStream(
  messages: ClodMessage[],
  temperature: number = 0.7,
  maxTokens?: number
): AsyncGenerator<string, void, unknown> {
  if (CLOD_API_KEYS.length === 0) {
    throw new Error("CLOD_API_KEY_REQUIRED")
  }

  const actualModelName = "Qwen 3 235B A22B Thinking 2507"

  let lastError: Error | null = null
  const excludedKeyHashes = new Set<string>()

  function safeJson(value: unknown): string {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  function isLikelyInvalidKey(status: number, errorData: any): boolean {
    if (status === 401) return true
    if (status !== 403) return false
    const s = `${safeJson(errorData)}`.toLowerCase()
    return (
      (s.includes("invalid") && s.includes("key")) ||
      s.includes("incorrect api key") ||
      s.includes("api key invalid") ||
      s.includes("unauthorized")
    )
  }

  // We loop to allow retries on rate limits
  for (let attempt = 0; attempt < CLOD_API_KEYS.length * 2; attempt++) {
    let apiKey: string
    try {
      const auth = await checkClodAvailabilityInternal(excludedKeyHashes)
      apiKey = auth.apiKey
    } catch (e) {
      if (e instanceof Error && e.message === "CLOD_NO_ELIGIBLE_KEYS" && lastError) {
        throw lastError
      }
      throw e // Propagates Day/Minute exhausted errors directly
    }

    try {
      const body: any = {
        model: actualModelName,
        messages,
        temperature,
        stream: true,
        max_completion_tokens: maxTokens || 32000
      }

      const response = await fetch(`${CLOD_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `Clod API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`

        if (response.status === 429) {
          console.warn("[Clod] Rate limited, rotating key...")
          await markClodRateLimited(apiKey)
          continue
        }

        if ([401, 403].includes(response.status)) {
          if (isLikelyInvalidKey(response.status, errorData)) {
            await markClodInvalidKey(apiKey)
            lastError = new Error("CLOD_API_KEY_INVALID")
            continue
          }
          excludedKeyHashes.add(hashKey(apiKey))
          lastError = new Error(`CLOD_FORBIDDEN: ${safeJson(errorData)}`)
          continue
        }

        throw new Error(errMsg)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body stream")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === "data: [DONE]") continue
          if (!trimmed.startsWith("data: ")) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              yield delta
            }
          } catch {
            // Skip
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim() && buffer.trim() !== "data: [DONE]" && buffer.trim().startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.trim().slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {
          // Skip
        }
      }

      await recordClodUsage(apiKey)
      return
    } catch (error) {
      if (error instanceof Error && error.message.includes("ClodAllKeys")) {
        throw error
      }
      lastError = error instanceof Error ? error : new Error(String(error))
      const errMsg = lastError.message.toLowerCase()
      if (
        errMsg.includes("429") ||
        errMsg.includes("quota") ||
        errMsg.includes("failed to fetch")
      ) {
        await markClodRateLimited(apiKey)
        continue
      }
      throw lastError
    }
  }

  throw lastError || new Error("All Clod API keys failed")
}
