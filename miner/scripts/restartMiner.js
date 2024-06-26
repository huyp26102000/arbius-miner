const pm2 = require("pm2");
async function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
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
const restart = async () => {
  try {
    const status = await getPM2Status();
    console.log(status)
    if (status?.start) {
      pm2.restart("start", (restartErr) => {
        if (restartErr) {
          console.error("Restart error:", restartErr);
        }
        pm2.disconnect();
      });
      console.log("Restarted normal mine");
    }
    if (status?.["start-automine"]) {
      pm2.restart("start-automine", (restartErr) => {
        if (restartErr) {
          console.error("Restart error:", restartErr);
        }
        pm2.disconnect();
      });
      console.log("Restarted automine");
    }
  } catch (error) {
    console.log(error);
  }
};
(async () => {
  while (true) {
    await restart();
    await delay(300000);
  }
})();
