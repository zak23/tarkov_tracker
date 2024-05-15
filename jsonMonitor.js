const fs = require('fs');
const chokidar = require('chokidar');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = app.listen(3000, () => {
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
const userID = jsonData.info.aid;
    const username = jsonData.characters.pmc.Info.Nickname;
    // const registrationDate = jsonData.characters.pmc.Info.RegistrationDate;
    const level = jsonData.characters.pmc.Info.Level;
    const chestHealth = jsonData.characters.pmc.Health.BodyParts.Chest.Health;
    const headHealth = jsonData.characters.pmc.Health.BodyParts.Head.Health;
    const leftArmHealth = jsonData.characters.pmc.Health.BodyParts.LeftArm.Health;
    const leftLegHealth = jsonData.characters.pmc.Health.BodyParts.LeftLeg.Health;
    const rightArmHealth = jsonData.characters.pmc.Health.BodyParts.RightArm.Health;
    const rightLegHealth = jsonData.characters.pmc.Health.BodyParts.RightLeg.Health;
    const stomachHealth = jsonData.characters.pmc.Health.BodyParts.Stomach.Health;


    const Energy = jsonData.characters.pmc.Health.Energy;
    const Hydration = jsonData.characters.pmc.Health.Hydration;
    const Temperature = jsonData.characters.pmc.Health.Temperature;



    const registrationDate = new Date(jsonData.characters.pmc.Info.RegistrationDate * 1000).toLocaleString();

    // Handle inraid status with error handling
    let inRaidLocation = "none";
    let inRaidCharacter = "unknown";

    if (jsonData.inraid && jsonData.inraid.location && jsonData.inraid.character) {
        inRaidLocation = jsonData.inraid.location || "none";
        inRaidCharacter = jsonData.inraid.character || "unknown";
    }

    const scavUp = jsonData.characters.scav.Info.SavageLockTime;

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

    const insuranceReady = jsonData.insurance;

    // Add more fields as needed
    return {username, level, registrationDate, CurrentWinStreakValue, KilledUsec, KilledBear, inRaidLocation, inRaidCharacter, TotalInGameTime, scavUp, insuranceReady, Energy, Hydration, Temperature, chestHealth, headHealth, leftArmHealth, leftLegHealth, rightArmHealth, rightLegHealth, stomachHealth, userID};
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
