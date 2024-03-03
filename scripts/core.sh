#!/bin/bash

# Name of the tmux session
session_name="ipfs"

# Name of the script file to run
script_to_run="ipfs.sh"

# Create a new tmux session if it doesn't exist, otherwise attach to the existing one
tmux has-session -t $session_name 2>/dev/null

if [ $? != 0 ]; then
    # Start a new tmux session if it doesn't exist
    tmux new-session -d -s $session_name

    # Split the window horizontally
    tmux split-window -h
fi

# Send a command to the first pane to run the script
tmux send-keys -t $session_name:0.0 "bash $script_to_run" C-m

# Attach to the tmux session
tmux attach-session -t $session_name