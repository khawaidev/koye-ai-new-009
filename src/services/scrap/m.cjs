const fs = require("fs");

// Read original JSON
const games = JSON.parse(fs.readFileSync("games.json", "utf8"));

// Extract only id and game name
const gameNames = games.map(game => ({
    id: game.id,
    "Game-name": game.gameName.replace("Game UI Database - ", "").trim()
}));

// Save to new file
fs.writeFileSync(
    "game-names.json",
    JSON.stringify(gameNames, null, 2)
);

console.log(`Extracted ${gameNames.length} game names.`);