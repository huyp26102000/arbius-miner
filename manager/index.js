const express = require("express");
const pm2 = require("pm2");
const app = express();
require("dotenv").config();
const PORT = 3001;
app.get("/", (req, res) => {
  res.send("Arbius manager api");
});
const actions = ["claim", "start", "start-automine"];

app.get("/pm2/jobs", (req, res) => {
  pm2.connect((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    pm2.list((err, processes) => {
      if (err) {
        console.error(err);
        pm2.disconnect();
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(
        actions.map((e) => {
          const process = processes.find((j) => j?.name == e);
          return {
            name: e,
            id: process?.pm_id,
            status: process?.pm2_env?.status == "online",
          };
        })
      );
      pm2.disconnect();
    });
  });
});
const acceptAction = ["claim", "stopclaim", "mine", "automine", "stopall"];
app.get("/action", (req, res) => {
  const job = req?.query?.job;
  if (acceptAction.includes(job)) {
    switch (job) {
      case "claim":
        try {
          pm2.connect((err) => {
            if (err) {
              console.error(err);
              process.exit(2);
            }
            pm2.restart("claim", (restartErr) => {
              if (restartErr) {
                console.error(restartErr);
                res.send(restartErr);
              }
              pm2.disconnect();
            });
          });
          res.send("Successfully start service");
        } catch (error) {
          res.send(restartErr, 404);
        }
        break;
      case "stopclaim":
        try {
          pm2.stop("claim");
          res.send("Successfully stop service");
        } catch (error) {
          res.send(restartErr, 404);
        }
        break;
      case "mine":
        try {
          (async () => {
            pm2.connect(async (err) => {
              if (err) {
                console.error(err);
                process.exit(2);
              }
              await new Promise(async (resolve) => {
                pm2.restart("start", (restartErr) => {
                  if (restartErr) {
                    console.error(restartErr);
                    res.send(restartErr);
                  }
                  resolve();
                });
              });
              await new Promise(async (resolve) => {
                pm2.stop("start-automine", (restartErr) => {
                  if (restartErr) {
                    console.error(restartErr);
                    res.send(restartErr);
                  }
                  pm2.disconnect();
                  resolve();
                });
              });
            });

            res.send("Successfully start service");
          })();
        } catch (error) {
          res.send(restartErr, 404);
        }
        break;
      case "automine":
        try {
          (async () => {
            pm2.connect(async (err) => {
              if (err) {
                console.error(err);
                process.exit(2);
              }
              await new Promise(async (resolve) => {
                pm2.restart("start-automine", (restartErr) => {
                  if (restartErr) {
                    console.error(restartErr);
                    res.send(restartErr);
                  }
                  resolve();
                });
              });
              await new Promise(async (resolve) => {
                pm2.stop("start", (restartErr) => {
                  if (restartErr) {
                    console.error(restartErr);
                    res.send(restartErr);
                  }
                  pm2.disconnect();
                  resolve();
                });
              });
            });

            res.send("Successfully start service");
          })();
        } catch (error) {
          res.send(restartErr, 404);
        }
        break;
      case "stopall":
        try {
          (async () => {
            pm2.connect(async (err) => {
              if (err) {
                console.error(err);
                process.exit(2);
              }
              await new Promise(async (resolve) => {
                pm2.stop("start", (restartErr) => {
                  if (restartErr) {
                    console.error(restartErr);
                    res.send(restartErr);
                  }
                  resolve();
                });
              });
              await new Promise(async (resolve) => {
                pm2.stop("start-automine", (restartErr) => {
                  if (restartErr) {
                    console.error(restartErr);
                    res.send(restartErr);
                  }
                  pm2.disconnect();
                  resolve();
                });
              });
            });

            res.send("Successfully start service");
          })();
        } catch (error) {
          res.send(restartErr, 404);
        }
        break;
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
