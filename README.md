# FAST SETUP

## For VASTAI CLOUD SERVICES
Install python
```
pip install --upgrade vastai;
vastai set api-key <API KEY>
```
Search offer and contract
```
vastai search offers
vastai create instance <id> --image r8.im/kasumi-1/kandinsky-2@sha256:373fa540ae197fc89f0679ed835bc4524152956d4f3027580244e10b09d6d3a5 --env '-p 5000:5000 -p 22:22' --onstart-cmd 'python -m cog.server.http' --jupyter-dir /src --ssh --direct --disk 100
```
or just follow [Here](https://cloud.vast.ai/cli/) 

## Setting up
```
touch ~/.no_auto_tmux;
```
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
npm install -g yarn
npm install -g pm2
```
## Run
<b>Mining</b>
```
pm2 start build/start-automine.js -- MiningConfig.json
pm2 start build/start.js -- MiningConfig.json
pm2 start yarn --name "claim" -- scan:unclaimed
```
<b>Claiming</b>

## Free up storage & Unpin IPFS
```
ipfs pin ls --type recursive | cut -d' ' -f1 | xargs -n1 ipfs pin rm
du -h --max-depth=1
rm ~/.pm2/pm2.log
```