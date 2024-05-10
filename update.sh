#!/bin/bash

# Navigate to your Git repository
cd /path/to/your/repository

# Pull changes from Git
git pull

# Build Docker image with no cache
docker build --no-cache -t tarkov_tracker .

# Run Docker container
docker run -v /home/docker/fika/user/profiles:/usr/src/app/profiles -p 3034:3034 tarkov_tracker
