#!/bin/bash

# Stop the image
id=$(docker ps | grep 'mfa-processor' | grep -P '\w{12}' | awk '{print $1}')
docker stop $id

# Remove the image
image=$(docker images | grep 'mfa-processor' | grep -P '\w{12}' | awk '{print $3}')
docker rmi $image --force

clear

docker images