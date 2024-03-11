import { readFileSync, writeFileSync } from "fs";
import { ethers } from "ethers";
import { initializeLogger, log } from "./log";
import { initializeMiningConfig, c } from "./mc";
import { initializeBlockchain, wallet, arbius } from "./blockchain";
import EngineABI from "./artifacts/contracts/EngineV2.sol/EngineV2.json";
const maxBlocks = 10_000;

type Contestation = {
  address: string;
  task: string;
  fromBlock: number;
  toBlock: number;
};
type ContestationVote = {
  address: string;
  task: string;
  yea: boolean;
};

const getLogs = async (
  arbiusContract: any,
  startBlock: number,
  endBlock: number
) => {
  const contestations: Contestation[] = [];
  const contestationVotes: ContestationVote[] = [];

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
          arbius.interface.getEventTopic("ContestationSubmitted"),
          arbius.interface.getEventTopic("ContestationVote"),
        ],
      ],
      fromBlock,
      toBlock,
    });

    events.map(async (event) => {
      const parsedLog = arbius.interface.parseLog(event);
      switch (parsedLog.name) {
        case "ContestationSubmitted":
          const taskData = await arbiusContract.tasks(parsedLog.args.task);
          if (taskData[2] == "0x040c266875914B3C0aEcB70Ea0c5dD1cB577f650") {
            log.debug(`Found contestation submitted: ${parsedLog.args.task}`);
            contestations.push({
              address: parsedLog.args.addr,
              task: parsedLog.args.task,
              fromBlock,
              toBlock,
            });
          }

          break;
        case "ContestationVote":
          log.debug(`Found contestation vote: ${parsedLog.args.task}`);
          contestationVotes.push({
            address: parsedLog.args.addr,
            task: parsedLog.args.task,
            yea: parsedLog.args.yea,
          });
          break;
      }
    });

    log.debug(`Total contestations: ${contestations.length}`);

    if (toBlock === endBlock) break;
    fromBlock = toBlock + 1;
    toBlock =
      endBlock - fromBlock + 1 > maxBlocks
        ? fromBlock + maxBlocks - 1
        : endBlock;
  }

  return {
    contestations,
    contestationVotes,
  };
};

async function main(configPath: string) {
  try {
    const mconf = JSON.parse(readFileSync(configPath, "utf8"));
    initializeMiningConfig(mconf);
  } catch (e) {
    console.error(`unable to parse ${configPath}`);
    process.exit(1);
  }

  initializeLogger(null);

  await initializeBlockchain();
  const rpc = JSON.parse(JSON.stringify(arbius.provider))?.connection?.url;

  const endBlock = +(await wallet.provider.getBlockNumber());

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const arbiusContract = new ethers.Contract(
    "0x3BF6050327Fa280Ee1B5F3e8Fd5EA2EfE8A6472a",
    EngineABI.abi,
    provider
  );
  const { contestations, contestationVotes } = await getLogs(
    arbiusContract,
    endBlock - 1000000,
    endBlock
  );
  log.debug(`${contestations.length} contested tasks found}`);
  writeFileSync("contestations.json", JSON.stringify(contestations, null, 2));
  writeFileSync(
    "contestationVotes.json",
    JSON.stringify(contestationVotes, null, 2)
  );
}

// if (process.argv.length < 3) {
//   log.error(
//     "usage: yarn scan:contested MiningConfig.json [startBlock] [endBlock]"
//   );
//   process.exit(1);
// }

main("MiningConfig.json");
