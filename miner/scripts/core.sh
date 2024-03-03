#!/bin/bash

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
echo "NVM directory: $NVM_DIR"
nvm install --lts
NVM_VERSION=$(nvm --version)
npm install -g yarn
npm install -g pm2