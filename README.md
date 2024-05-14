# Tarkov Tracker

Tarkov Tracker is a real-time leaderboard for modded versions of Escape from Tarkov using SPTarkov and Fika. This project monitors JSON files containing player profiles and displays various player statistics on a web-based leaderboard.
Ideally you would run this alongside https://hub.docker.com/r/k2rlxyz/fika See more here: https://discord.com/channels/1202292159366037545/1236681505451933758

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time monitoring of player profiles
- Display player statistics including level, health, kills, and more
- Real-time updates with WebSockets
- Customizable display names for in-game locations
- Dark war-like theme using Bootstrap

## Requirements

- Node.js
- NPM (Node Package Manager)
- SPTarkov
- Fika

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/zak23/tarkov_tracker.git
    cd tarkov_tracker
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Set up SPTarkov and Fika:**
    - Ensure SPTarkov and Fika are installed and configured correctly.
    - Place JSON files containing player profiles in the `json_files` directory.

## Usage

1. **Start the server:**
    ```sh
    node jsonMonitor.js
    ```

2. **Open your browser and navigate to:**
    ```
    http://localhost:3000
    ```

3. **Monitor the leaderboard:**
    - The leaderboard will display player statistics in real-time.
    - Press the "Update Leaderboard" button to manually refresh the data.

## Shell Script Usage
We have provided a shell script to automate the process of pulling the latest changes from the Git repository, building a Docker image, and running a Docker container.

 ```sh
 sh update.sh
 ```

## Configuration

### WebSocket Server

The WebSocket server is set up to listen for changes in the JSON files and update the leaderboard accordingly.

### Docker Settings

Make sure to set the correct volume path for the JSON files in the Fike Docker container. The default path is `/usr/src/app/profiles`.
Change the port to something you have free on your host machine. The default port is `3034` as I have other things running.

```sh
docker run --name $custom_container_name -d -v /home/docker/fika/user/profiles:/usr/src/app/profiles -p 3034:3000 tarkov_tracker
```

## Contributing
Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: git checkout -b feature/your-feature-name.
3. Make your changes and commit them: git commit -m 'Add your feature'.
4. Push to the branch: git push origin feature/your-feature-name.
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgements
- SPTarkov
- Fika
- https://hub.docker.com/r/k2rlxyz/fika
- Bootstrap

## Contact
For any inquiries or issues, please contact [zak@zakozbourne.com].



