// app.js

// WebSocket connection
// const ws = new WebSocket('ws://192.168.1.144:3034');
const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));

// Function to fetch updated player information
function updateLeaderboard() {
    console.log('Sending request to update leaderboard...');
    // Check if WebSocket connection is open
    if (ws.readyState === WebSocket.OPEN) {
        // Send a message to the server to request updated player information
        ws.send('updateLeaderboard');
    } else {
        console.log('WebSocket connection is not open.');
    }
}

// Trigger update leaderboard function when page loads
window.onload = () => {
    console.log('Page loaded, updating leaderboard...');
    updateLeaderboard();
};

// Event listener for WebSocket messages
ws.onmessage = (event) => {
    const playerInfoArray = JSON.parse(event.data);
    handlePlayerInfo(playerInfoArray);
};

const locationMapping = {
    // Add mappings for internal names and display names
    "??" : "Shoreline",
    "??" : "Woods",
    "bigmap" : "Customs",
    "??" : "Factory",
    "??" : "Lighthouse",
    "Interchange" : "Interchange",
    "ResevBase" : "Reserve",
    "??" : "Streets of Tarkov",
    "??" : "The Lab"
};


// Function to handle received player information and update the leaderboard
function handlePlayerInfo(playerInfoArray) {
    console.log('Received updated player information:', playerInfoArray);
    const leaderboardBody = document.getElementById('leaderboard-body');

    // Clear previous leaderboard entries
    leaderboardBody.innerHTML = '';

    // Loop through player info array and populate the leaderboard
    playerInfoArray.forEach((playerInfo, index) => {
        const {username, level, health, registrationDate, CurrentWinStreakValue, KilledPmc, inRaidLocation, inRaidCharacter} = playerInfo;

        // Determine status cell color based on player's location
        const statusCellColor = inRaidLocation !== "none" ? "green" : "red";

        // Map internal location name to display name
        const displayLocation = locationMapping[inRaidLocation] || inRaidLocation;

        // Construct the row with updated status cell and character information
        const statusIcon = `<i class="fa-solid fa-circle" style="color: ${statusCellColor}"></i>`;
        const statusInfo = inRaidLocation !== "none" ? `${statusIcon} ${inRaidCharacter} - ${displayLocation}` : statusIcon;

        const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${registrationDate}</td>
        <td>${username}</td>
        <td>${level}</td>
        <td>${statusInfo}</td>
        <td>${KilledPmc}</td>
        <td>${CurrentWinStreakValue}</td>
        <!-- Add more table cells for additional player information -->
      </tr>
    `;
        leaderboardBody.innerHTML += row;
    });
}







