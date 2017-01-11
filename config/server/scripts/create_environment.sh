#!bin/bash

if [[ "$1" == "development" ]]; then
    env = "development"
else
    env = "production"
fi

sudo apt-get update

###################
# DB ENVIRONMENT
###################
if [[ "$1" == "db"  ||  "$1" == "development" ]]; then
    sudo bash create_db_environment.sh $env
fi

###################
# WEB ENVIRONMENT
###################
if [[ "$1" == "web" || "$1" == "development" ]]; then
    sudo bash create_web_environment.sh $env
fi

