#!/bin/bash

# Ensure the script exits on any command failure
set -e

# Define environment variables for the container
CONTAINER_NAME="my_container"
IMAGE_NAME="my_docker_image"
ENV_FILE="/path/to/.env"  # Path to your .env file

# Pull the latest Docker image
echo "Pulling the latest image: $IMAGE_NAME"
docker pull $IMAGE_NAME

# Stop and remove the currently running container if it exists
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping running container: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
    echo "Removing container: $CONTAINER_NAME"
    docker rm $CONTAINER_NAME
fi

# Run the new container with environment variables
echo "Starting a new container: $CONTAINER_NAME"
docker run -d --name $CONTAINER_NAME -p 3030:3030 --env-file $ENV_FILE $IMAGE_NAME

echo "Deployment complete. New container is running: $CONTAINER_NAME"