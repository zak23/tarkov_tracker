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
    "Shoreline": "Shoreline",
    "Woods": "Woods",
    "bigmap": "Customs",
    "factory4_day": "Factory",
    "factory4_night": "Factory",
    "Lighthouse": "Lighthouse",
    "Interchange": "Interchange",
    "RezervBase": "Reserve",
    "TarkovStreets": "Streets of Tarkov",
    "Sandbox": "Ground Zero",
    "??": "The Lab"
};



// Function to handle received player information and update the leaderboard
function handlePlayerInfo(playerInfoArray) {
    console.log('Received updated player information:', playerInfoArray);
    const leaderboardBody = document.getElementById('leaderboard-body');

    // Clear previous leaderboard entries
    leaderboardBody.innerHTML = '';

    // Loop through player info array and populate the leaderboard
    playerInfoArray.forEach((playerInfo, index) => {
        const {
            username,
            level,
            health,
            registrationDate,
            CurrentWinStreakValue,
            KilledUsec,
            KilledBear,
            inRaidLocation,
            inRaidCharacter,
            TotalInGameTime
        } = playerInfo;

// Determine status cell color based on player's location
        const statusCellColor = inRaidLocation !== "none" ? "green" : "red";
// Map internal location name to display name
        const displayLocation = locationMapping[inRaidLocation] || inRaidLocation;

// Define icon based on character type
        let characterIcon = '';
        if (inRaidCharacter === 'pmc') {
            characterIcon = '<i class="fa-solid fa-person-rifle"></i>'; // Icon for PMC
        } else if (inRaidCharacter === 'scav') {
            characterIcon = '<i class="fa-solid fa-recycle"></i>'; // Icon for Scav
        }

// Construct the row with updated status cell, character icon, and location information
        const statusIcon = `<i class="fa-solid fa-circle" style="color: ${statusCellColor}"></i>`;
        const statusInfo = inRaidLocation !== "none" ? `${statusIcon} ${characterIcon} ${displayLocation}` : statusIcon;

        function convertSecondsToMinutesAndHours(seconds) {
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(seconds / 3600); // Corrected calculation for hours
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }

// Inside the handlePlayerInfo function
        const totalInGameTimeFormatted = convertSecondsToMinutesAndHours(TotalInGameTime);



        const row = `
      <tr>
        <td>${index + 1}</td>
              <td>${statusInfo}</td>
        
<!--        <td>${registrationDate}</td>-->
        <td>${username}</td>
        <td>${level}</td>
  
        <td>${KilledUsec + KilledBear}</td>
        <td>${CurrentWinStreakValue}</td>
       <td>${totalInGameTimeFormatted}</td>
        <!-- Add more table cells for additional player information -->
      </tr>
    `;
        leaderboardBody.innerHTML += row;
    });
}







