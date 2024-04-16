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
    if (status?.start) {
      pm2.restart("start", (restartErr) => {
        if (restartErr) {
          console.error("Restart error:", restartErr);
        }
        pm2.disconnect();
      });
    }
    if (status?.start) {
      pm2.restart("start-automine", (restartErr) => {
        if (restartErr) {
          console.error("Restart error:", restartErr);
        }
        pm2.disconnect();
      });
    }
  } catch (error) {
    console.log(error);
  }
};
(async () => {
  while (true) {
    await restart();
    await delay(2000);
  }
})();
