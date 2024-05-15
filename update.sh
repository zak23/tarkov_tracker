#!/bin/bash

# Define the custom container name
custom_container_name="tarkovtracker"

# Check if a container with the specified name is running
if [ "$(docker ps -q -f name=$custom_container_name)" ]; then
    # Stop and remove the container if it's running
    echo "Stopping and removing existing container with name $custom_container_name..."
    docker stop $custom_container_name
    docker rm $custom_container_name
fi

# Pull changes from Git
git pull

# Build Docker image with no cache
docker build --no-cache -t tarkov_tracker .

# Run Docker container with custom name in detached mode
docker run --name $custom_container_name --restart unless-stopped -d -v /home/docker/fika/user/profiles:/usr/src/app/profiles -p 3034:3000 tarkov_tracker
