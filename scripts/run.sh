#!/bin/bash
docker run -d -v /home/mark/mfa-processor:/usr/app/logs airburst/mfa-processor
clear
docker ps