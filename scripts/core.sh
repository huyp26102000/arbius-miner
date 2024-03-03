#!/bin/bash

touch ~/.no_auto_tmux;

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash &&
source ~/.bashrc &&
sleep 4
nvm install --lts
npm install -g yarn
yarn
npm i -g pm2