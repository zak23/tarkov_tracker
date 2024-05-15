// app.js

$(document).ready(function () {
    $('.table .accordion-toggle').click(function (e) {
        e.preventDefault();

        var $row = $(this).closest('tr');
        var $target = $($row.data('target'));

        if ($target.hasClass('in')) {
            $target.collapse('hide');
            $(this).find('button').text('Expand');
        } else {
            $target.collapse('show');
            $(this).find('button').text('Collapse');
        }
    });
});

// WebSocket connection
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
    "Laboratory": "The Lab"
};


// Function to handle received player information and update the leaderboard
function handlePlayerInfo(playerInfoArray) {
    const currentTime = new Date().toLocaleString();
    // console.log(currentTime);
    console.log(`Received updated player information at ${currentTime}:`, playerInfoArray);
    const leaderboardBody = document.getElementById('leaderboard-body');

    // Clear previous leaderboard entries
    leaderboardBody.innerHTML = '';

    // Loop through player info array and populate the leaderboard
    playerInfoArray.forEach((playerInfo, index) => {
        const {
            username,
            level,
            registrationDate,
            CurrentWinStreakValue,
            KilledUsec,
            KilledBear,
            inRaidLocation,
            inRaidCharacter,
            TotalInGameTime,
            scavUp,
            insuranceReady,
            Energy,
            Hydration,
            Temperature,
            chestHealth,
            headHealth,
            leftArmHealth,
            leftLegHealth,
            rightArmHealth,
            rightLegHealth,
            stomachHealth,
            userID
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

        const epochTime = Math.floor(Date.now() / 1000); // Get the current epoch time in seconds

        let statusScavCellColor;

        if (epochTime > scavUp) {
            statusScavCellColor = 'green';
        } else {
            statusScavCellColor = 'red'; // You can choose another color if needed
        }

        const statusScavIcon = `<i class="fa-solid fa-circle" style="color: ${statusScavCellColor}"></i>`;

        // console.log(insuranceReady);

        // Iterate over each entry in the insurance array
        let count = 0;
        let shortestRemainingTime = Infinity;

        // Function to format seconds into HH:MM:SS
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }


        insuranceReady.forEach(entry => {
            const scheduledTime = entry.scheduledTime;
            const maxStorageTime = entry.maxStorageTime;
            const expirationTime = scheduledTime + maxStorageTime;
            const remainingTime = expirationTime - epochTime;

            if (remainingTime > 0) {
                count++;
                // console.log(`Scheduled time ${scheduledTime} is in the future. Remaining time: ${formatTime(remainingTime)}`);
                if (remainingTime < shortestRemainingTime) {
                    shortestRemainingTime = remainingTime;
                }
            } else {
                // console.log(`Scheduled time ${scheduledTime} is expired. Expiration was at: ${expirationTime}`);
            }
        });

        let statusInsuranceCellColor;
        let statusInsuranceIcon;

        if (count > 0) {
            statusInsuranceCellColor = 'green';
            statusInsuranceIcon = `<i class="fa-solid fa-circle" style="color: ${statusInsuranceCellColor}"></i>`;
            if (count > 1) {
                statusInsuranceIcon += ` <span>x${count}</span>`;
            }
        } else {
            statusInsuranceCellColor = 'red';
            statusInsuranceIcon = `<i class="fa-solid fa-circle" style="color: ${statusInsuranceCellColor}"></i>`;
        }

// Only show the time if there is at least one insurance ready
        let insuranceTimeDisplay = '';
        if (shortestRemainingTime !== Infinity) {
            insuranceTimeDisplay = formatTime(shortestRemainingTime);
            // console.log(`Shortest remaining time: ${insuranceTimeDisplay}`);
        } else {
            // console.log('No insurance entries are ready.');
        }

// Display the status icon and time conditionally
        const tableCellContent = count > 0 ? `${statusInsuranceIcon} - ${insuranceTimeDisplay}` : statusInsuranceIcon;
        const tableCell = `${tableCellContent}`;

        const row = `
     <tr data-toggle="collapse" data-target="#${username}" class="accordion-toggle">
        <td>${index + 1}</td>
        <td>${statusInfo}</td>
<!--        <td>${registrationDate}</td>-->
        <td>${username}</td>
        <td>${level}</td>

        <td>${KilledUsec + KilledBear}</td>
        <td>${CurrentWinStreakValue}</td>
     
        <td>${statusScavIcon}</td>
        <td>${tableCell}</td>
        <td><button class="btn btn-sm btn-info">Expand</button></td>
        <!-- Add more table cells for additional player information -->
      </tr>
       <tr>
            <td colspan="10" class="hiddenRow">
                <div class="accordian-body collapse" id="${username}"> 
                <div class="container">
                <div class="row">
          
                   <div class="col-md-4"> <h6>Additional Player Information</h6>
                   <h6>Stats</h6>
                     <p>Total In-Raid Time: ${totalInGameTimeFormatted}</p>
                    </div>
                     <div class="col-md-4">
                     <h6>Health</h6> 
                        <p>Chest Health: ${chestHealth.Current / chestHealth.Maximum * 100}%</p>
                        <p>Head Health: ${headHealth.Current / headHealth.Maximum * 100}%</p>
                        <p>Left Arm Health: ${leftArmHealth.Current / leftArmHealth.Maximum * 100}%</p>
                        <p>Left Leg Health: ${leftLegHealth.Current/ leftLegHealth.Maximum * 100}%</p>
                        <p>Right Arm Health: ${rightArmHealth.Current / rightArmHealth.Maximum * 100}%</p>
                        <p>Right Leg Health: ${rightLegHealth.Current/ rightLegHealth.Maximum * 100}%</p>
                        <p>Stomach Health: ${stomachHealth.Current/ stomachHealth.Maximum * 100}%</p>
                        
                    </div>
                     <div class="col-md-4">
                    <p>Energy: ${Energy.Current}</p>
                        <p>Hydration: ${Hydration.Current}</p>
                        <p>Temperature: ${Temperature.Current}</p>
                    </div>
                   </div></div>
                </div>
            </td>
        </tr>
    `;
        leaderboardBody.innerHTML += row;
    });
}







