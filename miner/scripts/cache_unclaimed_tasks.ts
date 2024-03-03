import { readFileSync, writeFileSync, existsSync } from "fs";
import { ethers } from "ethers";
import { initializeLogger, log } from "../src/log";
import { initializeMiningConfig, c } from "../src/mc";
import { initializeBlockchain, wallet, arbius } from "../src/blockchain";
import { expretry, delay, sleep } from "../src/utils";

const maxBlocks = 10_000;

const getLogs = async (
  targetAddress: string,
  startBlock: number,
  endBlock: number
) => {
  const unclaimedTasks: string[] = [];

  let fromBlock = startBlock;
  let toBlock =
    endBlock - fromBlock + 1 > maxBlocks ? fromBlock + maxBlocks - 1 : endBlock;

  while (toBlock <= endBlock) {
    log.debug(
      `Processing block [${fromBlock.toString()} to ${toBlock.toString()}]`
    );

    const events = await arbius.provider.getLogs({
      address: arbius.address,
      topics: [
        [
          arbius.interface.getEventTopic("SolutionSubmitted"),
          arbius.interface.getEventTopic("SolutionClaimed"),
        ],
        ethers.utils.hexZeroPad(targetAddress, 32),
      ],
      fromBlock,
      toBlock,
    });

    events.map((event) => {
      const parsedLog = arbius.interface.parseLog(event);
      switch (parsedLog.name) {
        case "SolutionSubmitted":
          log.debug(`Found solution submitted: ${parsedLog.args.task}`);
          unclaimedTasks.push(parsedLog.args.task);
          break;
        case "SolutionClaimed":
          log.debug(`Found solution claimed: ${parsedLog.args.task}`);
          const unclaimedTaskIdx = unclaimedTasks.indexOf(parsedLog.args.task);
          if (unclaimedTaskIdx > -1) {
            unclaimedTasks.splice(unclaimedTaskIdx, 1);
          }
          break;
      }
    });

    log.debug(`Unclaimed solutions: ${unclaimedTasks.length}`);

    if (toBlock === endBlock) break;
    fromBlock = toBlock + 1;
    toBlock =
      endBlock - fromBlock + 1 > maxBlocks
        ? fromBlock + maxBlocks - 1
        : endBlock;
  }

  return unclaimedTasks;
};
async function processAutoClaim(configPath: string) {
  let lastScanBlock;
  let coreAddress;
  const unclaimedPath = "unclaimed.json";
  try {
    lastScanBlock = await readFileSync("currentblock.txt", "utf8");
  } catch (error) {
    console.log("No currentblock.txt found!");
  }
  let taskids: any = [];
  try {
    if (existsSync(unclaimedPath)) {
      taskids = JSON.parse(readFileSync(unclaimedPath, "utf8"));
    } else {
      const defaultContent = "[]";
      writeFileSync(unclaimedPath, defaultContent, "utf8");
    }
  } catch (e) {
    console.error(`unable to parse ${unclaimedPath}`);
    process.exit(1);
  }

  try {
    const mconf = JSON.parse(readFileSync(configPath, "utf8"));
    console.log(mconf);
    coreAddress = mconf?.blockchain?.core_address;
    initializeMiningConfig(mconf);
  } catch (e) {
    console.error(`unable to parse ${configPath}`);
    process.exit(1);
  }

  initializeLogger(null);

  await initializeBlockchain();
  if (!coreAddress) {
    console.log(`No core_address in ${configPath}`);
    return;
  }
  const currentBlock: any = +(await wallet.provider.getBlockNumber()) - 1;
  console.log("Current block", currentBlock);
  await writeFileSync("currentblock.txt", currentBlock.toString());
  const unclaimedTasks = await getLogs(
    coreAddress,
    Number(lastScanBlock),
    Number(currentBlock)
  );
  taskids = [...taskids, ...unclaimedTasks];
  writeFileSync("unclaimed.json", JSON.stringify(taskids));
  log.debug(
    `${unclaimedTasks.length} unclaimed tasks found for ${wallet.address}`
  );
  // writeFileSync('unclaimed.json', JSON.stringify(unclaimedTasks));
  await delay(2000);
  console.log("Start claiming!");

  const claimedList: any = [];
  for (let taskid of taskids) {
    try {
      log.debug(`Attempting to claim ${taskid}`);

      const tx = await expretry(
        async () => await arbius.claimSolution(taskid),
        1
      );
      const receipt = await tx.wait();
      log.info(`Claimed ${taskid} in ${receipt.transactionHash}`);
      claimedList.push(taskid);
    } catch (error: any) {
      // @ts-ignore
      console.log(error?.error?.reason);
      if (error?.error?.reason == "execution reverted: already claimed") {
        claimedList.push(taskid);
      }
    }
  }
  writeFileSync(
    "unclaimed.json",
    JSON.stringify(taskids.filter((itemA: any) => !claimedList.includes(itemA)))
  );
  console.log(claimedList);
}

(async () => {
  while (true) {
    await processAutoClaim("MiningConfig.json");
    await delay(1000);
  }
})();
