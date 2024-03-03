#!/bin/bash

# Set the service name and command
while true; do
    echo "Restarting miner at $(date)"
    /root/.nvm/versions/node/v20.11.1/bin/pm2 restart 0
    # Sleep for 3 minutes before restarting again
    sleep 300
done
