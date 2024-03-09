const express = require("express");
const pm2 = require("pm2");
const app = express();
const { default: axios } = require("axios");
require("dotenv").config();
const { readFileSync, writeFileSync, existsSync } = require("fs");
async function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

const actions = ["claim", "start", "start-automine"];
const coreUrl = "https://miner-manager-tg0l.onrender.com";
let coreAddress;
try {
  const mconf = JSON.parse(readFileSync("../miner/MiningConfig.json", "utf8"));
  coreAddress = mconf?.blockchain?.core_address;
} catch (e) {
  console.error(`unable to parse ${configPath}`);
  process.exit(1);
}
const getPM2Status = async () => {
  return new Promise((resolve) => {
    pm2.list((err, processes) => {
      if (err) {
        console.error(err);
        pm2.disconnect();
        return;
      }
      const localStatus = {
        claim:
          processes.find((j) => j?.name == "claim")?.pm2_env?.status ==
          "online",
        start:
          processes.find((j) => j?.name == "start")?.pm2_env?.status ==
          "online",
        "start-automine":
          processes.find((j) => j?.name == "start-automine")?.pm2_env?.status ==
          "online",
      };
      resolve(localStatus);
    });
  });
};
const processUpdateStatus = async () => {
  try {
    const resp = await axios.get(`${coreUrl}/status?address=${coreAddress}`);
    const statusData = resp.data;
    const localStatus = await getPM2Status();
    pm2.connect((err) => {
      if (err) {
        console.error("PM2 connection error:", err);
        process.exit(2);
      }
      if (statusData?.claim && localStatus?.claim === false) {
        console.log("Running claiming");
        pm2.restart("claim", (restartErr) => {
          if (restartErr) {
            console.error("Restart error:", restartErr);
          }
          pm2.disconnect();
        });
      }

      if (statusData?.claim === false && localStatus?.claim === true) {
        console.log("Running stopping");
        pm2.stop("claim", (stopErr) => {
          if (stopErr) {
            console.error("Stop error:", stopErr);
          }
          pm2.disconnect();
        });
      }
      if (statusData?.start && localStatus?.start === false) {
        console.log("Running start");
        pm2.restart("start", (restartErr) => {
          if (restartErr) {
            console.error("Restart error:", restartErr);
          }
          pm2.disconnect();
        });
      }

      if (statusData?.start === false && localStatus?.start === true) {
        console.log("Running stopping start");
        pm2.stop("start", (stopErr) => {
          if (stopErr) {
            console.error("Stop error:", stopErr);
          }
          pm2.disconnect();
        });
      }
      if (
        statusData?.["start-automine"] &&
        localStatus?.["start-automine"] === false
      ) {
        console.log("Running start-automine");
        pm2.restart("start-automine", (restartErr) => {
          if (restartErr) {
            console.error("Restart error:", restartErr);
          }
          pm2.disconnect();
        });
      }

      if (
        statusData?.["start-automine"] === false &&
        localStatus?.["start-automine"] === true
      ) {
        console.log("Running stopping start-automine");
        pm2.stop("start-automine", (stopErr) => {
          if (stopErr) {
            console.error("Stop error:", stopErr);
          }
          pm2.disconnect();
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
(async () => {
  while (true) {
    await processUpdateStatus();
    await delay(5000);
  }
})();
