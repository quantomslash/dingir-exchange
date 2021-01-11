import "./config.mjs"; // dotenv
import {
  balanceQuery,
  orderPut,
  balanceUpdate,
  assetList,
  marketList,
  orderDetail,
  marketSummary,
  orderCancel,
  orderDepth,
  debugReset,
  debugReload
} from "./client.mjs";

import { depositAssets, printBalance, putRandOrder, sleep } from "./util.mjs";

async function stressTest({ parallel, interval, repeat }) {
  await depositAssets({ BTC: "100000", ETH: "50000" });

  await printBalance();
  const startTime = new Date();
  function elapsedSecs() {
    return (new Date() - startTime) / 1000;
  }
  let count = 0;
  // TODO: check balance before and after stress test
  // depends https://github.com/Fluidex/dingir-exchange/issues/30
  while (true) {
    let promises = [];
    for (let i = 0; i < parallel; i++) {
      promises.push(putRandOrder());
    }
    await Promise.all(promises);
    if (interval > 0) {
      await sleep(interval);
    }
    count += 1;
    console.log(
      "avg op/s:",
      (parallel * count) / elapsedSecs(),
      "orders",
      parallel * count,
      "secs",
      elapsedSecs()
    );
    if (repeat != 0 && count >= repeat) {
      break;
    }
    //await printBalance();
  }
  await printBalance();
  const endTime = new Date();
  console.log("avg op/s:", (parallel * repeat) / elapsedSecs());
  console.log("stressTest done");
}

async function main() {
  try {
    await stressTest({ parallel: 10, interval: 1000, repeat: 30 });
  } catch (error) {
    console.error("Catched error:", error);
  }
}
main();
