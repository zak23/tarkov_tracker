const fs = require('fs');
const chokidar = require('chokidar');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = app.listen(3034, () => {
    console.log('Server listening');
});

app.use(express.static('public'));

const directoryToWatch = './profiles';
const watcher = chokidar.watch(directoryToWatch, {
    persistent: true,
});

console.log(`Monitoring JSON files in ${directoryToWatch} for changes...`);

const wss = new WebSocket.Server({server});

// Function to extract relevant player information from a JSON file
function extractPlayerInfo(filePath) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileData);

    const username = jsonData.characters.pmc.Info.Nickname;
    // const registrationDate = jsonData.characters.pmc.Info.RegistrationDate;
    const level = jsonData.characters.pmc.Info.Level;
    const health = jsonData.characters.pmc.Health.BodyParts.Chest.Health.Current;
    const registrationDate = new Date(jsonData.characters.pmc.Info.RegistrationDate * 1000).toLocaleString();
    // Assuming jsonData contains your JSON data
    const inraid = jsonData.inraid;

// Accessing the "location" and "character" properties
    const inRaidLocation = inraid.location;
    const inRaidCharacter = inraid.character;

    // Assuming jsonData contains your JSON data
    const CurrentWinStreakValue = jsonData.characters.pmc.Stats.Eft.OverallCounters.Items.find(item => {
        const keys = item.Key;
        // Check if the item has the keys "CurrentWinStreak" and "Pmc"
        return keys.includes("CurrentWinStreak") && keys.includes("Pmc");
    }).Value;

    const KilledUsec = jsonData.characters.pmc.Stats.Eft.OverallCounters.Items.find(item => {
        const keys = item.Key;
        // Check if the item has the keys "CurrentWinStreak" and "Pmc"
        return keys.includes("KilledUsec") && keys.includes("KilledUsec");
    }).Value;

    const KilledBear = jsonData.characters.pmc.Stats.Eft.OverallCounters.Items.find(item => {
        const keys = item.Key;
        // Check if the item has the keys "CurrentWinStreak" and "Pmc"
        return keys.includes("KilledBear") && keys.includes("KilledBear");
    }).Value;

    const TotalInGameTime = jsonData.characters.pmc.Stats.Eft.TotalInGameTime;
    // Add more fields as needed
    return {username, level, health, registrationDate, CurrentWinStreakValue, KilledUsec, KilledBear, inRaidLocation, inRaidCharacter, TotalInGameTime};
}


// Function to send player information to all connected WebSocket clients
function sendPlayerInfoToClients() {
    const playerInfoArray = [];
    fs.readdir(directoryToWatch, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${err}`);
            return;
        }

        files.forEach((file) => {
            const filePath = `${directoryToWatch}/${file}`;
            try {
                const playerInfo = extractPlayerInfo(filePath);
                playerInfoArray.push(playerInfo);
            } catch (error) {
                console.error(`Error extracting player info from file ${filePath}: ${error}`);
            }
        });

        // Sort players based on level (assuming level is a number)
        playerInfoArray.sort((a, b) => b.level - a.level);

        // Send player info to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(playerInfoArray));
            }
        });
    });
}


// WebSocket message handling
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Event listener for WebSocket messages
    ws.on('message', (message) => {
        const receivedMessage = message.toString(); // Convert message to string
        console.log('Received message from client:', receivedMessage);
        if (receivedMessage === 'updateLeaderboard') {
            console.log('Received request to update leaderboard');
            sendPlayerInfoToClients();
        }
    });
});


// Send player info from all files in the directory when the server starts
sendPlayerInfoToClients();

watcher.on('change', (path) => {
    console.log(`File ${path} has been changed`);
    sendPlayerInfoToClients();
});

watcher.on('error', (error) => {
    console.error(`Watcher error: ${error}`);
});
