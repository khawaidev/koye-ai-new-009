

import * as cheerio from "cheerio";
import fs from "fs";

const START_ID = 1;
const END_ID = 5000;
const CONCURRENCY = 20;
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
"games.json",
JSON.stringify(results, null, 2),
"utf8"
);

console.log("[SAVE] " + results.length + " games");
}

async function scrapeGame(id) {
const url =
`https://www.gameuidatabase.com/gameData.php?id=${id}`;

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

if (!title) {
  consecutiveFailures++;
  return;
}

const gameName =
  $("h1").first().text().trim() ||
  title.replace(" - Game UI Database", "").trim();

if (!gameName) {
  consecutiveFailures++;
  return;
}

const screenshots = [];

$("img").each((_, el) => {
  const src = $(el).attr("src");

  if (src && !screenshots.includes(src)) {
    screenshots.push(src);
  }
});

if (!discoveredIds.has(id)) {
  discoveredIds.add(id);

  results.push({
    id,
    gameName,
    url,
    screenshots
  });

  consecutiveFailures = 0;

  console.log(
    "[OK] " +
      id +
      " | " +
      gameName +
      " | " +
      screenshots.length +
      " images"
  );

  if (results.length % 25 === 0) {
    saveResults();
  }
}


} catch (err) {
consecutiveFailures++;


console.log(
  "[ERROR] " +
    id +
    " | " +
    err.message
);


} finally {
clearTimeout(timeout);
}

if (
consecutiveFailures >=
MAX_CONSECUTIVE_FAILURES
) {
stopCrawl = true;

console.log(
  "[STOP] " +
    MAX_CONSECUTIVE_FAILURES +
    " consecutive failures reached."
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

console.log(
"[WORKER " +
workerId +
"] stopped"
);
}

async function main() {
console.log(
"Starting crawl " +
START_ID +
" -> " +
END_ID +
" with " +
CONCURRENCY +
" workers"
);

const workers = [];

for (
let i = 0;
i < CONCURRENCY;
i++
) {
workers.push(worker(i + 1));
}

await Promise.all(workers);

saveResults();

console.log(
"Done. Found " +
results.length +
" games."
);
}

main();
