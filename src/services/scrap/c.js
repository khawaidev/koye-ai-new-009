

import * as cheerio from "cheerio";
import fs from "fs";

const START_ID = 1;
const END_ID = 20;
const CONCURRENCY = 5;
const REQUEST_TIMEOUT = 10000;
const MAX_CONSECUTIVE_FAILURES = 500;

const results = [];
const discoveredIds = new Set();

let currentId = START_ID;
let consecutiveFailures = 0;
let stopCrawl = false;

function saveResults() {
    results.sort((a, b) => a.id - b.id);

    fs.writeFileSync(
        "games1.json",
        JSON.stringify(results, null, 2),
        "utf8"
    );

    console.log(`[SAVE] ${results.length} games`);
}

function normalizeImageUrl(src) {
    if (!src) return null;

    if (src.startsWith("//")) {
        return `https:${src}`;
    }

    if (src.startsWith("/")) {
        return `https://www.gameuidatabase.com${src}`;
    }

    return src;
}

function isValidScreenshot(url) {
    const lower = url.toLowerCase();

    const blocked = [
        ".svg",
        "button",
        "icon",
        "social",
        "arrow",
        "badge",
        "logo",
        "vignette",
        "screenshine",
        "youtube",
        "linkedin",
        "bluesky",
        "feat_",
        "guidb",
        "audience",
        "btncolour"
    ];

    return !blocked.some(x => lower.includes(x));
}

async function scrapeGame(id) {
    const url = `https://www.gameuidatabase.com/gameData.php?id=${id}`;

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            consecutiveFailures++;
            return;
        }

        const html = await response.text();

        if (!html || html.length < 100) {
            consecutiveFailures++;
            return;
        }

        const $ = cheerio.load(html);

        const title = $("title").text().trim();

        let gameName = $("h1").first().text().trim();

        if (!gameName) {
            gameName = title
                .replace("| Game UI Database", "")
                .replace("- Game UI Database", "")
                .trim();
        }

        if (
            !gameName ||
            gameName.includes("Welcome") ||
            gameName.includes("Game UI Database 2.0")
        ) {
            consecutiveFailures++;
            return;
        }

        let platform = "";
        let genre = "";
        let releaseYear = ""; 

        $("tr").each((_, row) => {
            const cells = $(row).find("td");

            if (cells.length < 2) return;

            const key = $(cells[0]).text().trim().toLowerCase();
            const value = $(cells[1]).text().trim();

            if (key.includes("platform")) {
                platform = value;
            }

            if (key.includes("genre")) {
                genre = value;
            }

            if (key.includes("release") || key.includes("year")) {
                releaseYear = value;
            }
        });

        const screenshots = [];

        $("img").each((_, img) => {
            let src = $(img).attr("src");

            if (!src) return;

            src = normalizeImageUrl(src);

            if (!isValidScreenshot(src)) return;

            // 1. alt attribute — most reliable on gameuidatabase
            let type = ($(img).attr("alt") || "").trim();

            // 2. strip game name prefix: "Sonic Mania - Loading Screen" → "Loading Screen"
            if (type.includes(" - ")) {
                type = type.split(" - ").slice(1).join(" - ").trim();
            }

            // 3. fallback chain for when alt is missing or unhelpful
            if (!type) {
                const $el = $(img);
                type =
                    $el.attr("title") ||
                    $el.closest("figure").find("figcaption").first().text().trim() ||
                    $el.closest("[class*='item'],[class*='card'],[class*='slide']")
                        .find("[class*='label'],[class*='caption'],[class*='type'],[class*='name']")
                        .first().text().trim() ||
                    $el.next("p, span, div").first().text().trim() ||
                    "";
            }

            const alreadyAdded = screenshots.some(s => s.url === src);
            if (!alreadyAdded) {
                screenshots.push({ url: src, type: type || null });
            }
        });

        if (!screenshots.length) {
            consecutiveFailures++;
            return;
        }

        if (!discoveredIds.has(id)) {
            discoveredIds.add(id);

            results.push({
                id,
                gameName,
                platform,
                genre,
                releaseYear,
                url,
                screenshotCount: screenshots.length,
                screenshots
            });

            consecutiveFailures = 0;

            console.log(
                `[OK] ${id} | ${gameName} | ${screenshots.length} images`
            );

            if (results.length % 25 === 0) {
                saveResults();
            }
        }
    } catch (err) {
        consecutiveFailures++;

        console.log(`[ERROR] ${id} | ${err.message}`);
    } finally {
        clearTimeout(timeout);
    }

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        stopCrawl = true;

        console.log(
            `[STOP] ${MAX_CONSECUTIVE_FAILURES} consecutive failures reached`
        );
    }
}

async function worker(workerId) {
    while (!stopCrawl) {
        const id = currentId++;

        if (id > END_ID) {
            return;
        }

        await scrapeGame(id);
    }

    console.log(`[WORKER ${workerId}] stopped`);
}

async function main() {
    console.log(
        `Starting crawl ${START_ID} -> ${END_ID} with ${CONCURRENCY} workers`
    );

    const workers = [];

    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(i + 1));
    }

    await Promise.all(workers);

    saveResults();

    console.log(`Done. Found ${results.length} games.`);
}

main();