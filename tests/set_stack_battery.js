let BigNumber = require("./bignumber.js");
let SetStack = artifacts.require("SetStack");

const promisify = (inner) =>
  new Promise((resolve, reject) => {

    inner((err, res) => {

      if (err) { reject(err); }
      resolve(res);
    });
  });

function watchEvents(events, members, minBlocks) {

    return new Promise((resolve, reject) => {

      let numEvents = events.length;
      let stopCounter = 0;

      if (numEvents === 0) {
        reject();
      }

      return (() => {

          for (let i = 0; i < numEvents; i++) {

            console.log(members[i] + " event watch set");

            events[i].watch((error, result) => {

              console.log(members[i] + " event triggered");

              if (result.args.blockNum <= minBlocks[members[i] + "Block"]) {

                console.log(members[i] + " event ignored: old event");
                return;
              }

              if (!error) {

                if (members[i] === "disburse") {

                  console.log("Disburse Num: " + result.args.num);
                  console.log("Top CF Amount: " + result.args.cfAmount);
                  minBlocks["disburseBlock"] = result.args.blockNum;

                } else if (members[i] === "cf") {

                  console.log("Remaining Num: " + result.args.len);
                  console.log("Top CF Date: " + result.args.cfDate);
                  console.log("Top CF Amount: " + result.args.cfAmount);
                  minBlocks["cfBlock"] = result.args.blockNum;

                } else if (members[i] === "funded") {

                  console.log("Fully Funded: " + result.args.fullyFunded);
                  console.log("Next Payment Funded: " + result.args.nextPayFunded);
                  minBlocks["fundedBlock"] = result.args.blockNum;

                } else {

                  console.log(members[i] + ": " + eval("result.args." + members[i]));
                  minBlocks[members[i] + "Block"] = result.args.blockNum;
                }
              } else {
                console.log(error);
              }

              events[i].stopWatching((error, result) => {

                stopCounter++;
                console.log("Stopped watching " + members[i] + " event");

                if (stopCounter >= numEvents) { resolve(result); }
              });
            });
          }
      })();
    });
}

module.exports = async (callback) => {

  let e = null;
  let address = "0xac77204dd6ced029649c3af6c70031824376ede6";
  let instance = SetStack.at(address);
  let defaultAccount, defaultTxObj, txHash, gasPrice;
  let res, owner, status, beneficiary, maturity, cashflowDates;
  let cashflows, minFullFundingWei, minNextPayFundingWei;
  let fullyFunded, nextPayFunded, paymentsOutstanding;
  let balance, prom;
  let statusEvent, fundingEvent, beneficiaryEvent, disburseEvent, cfEvent;

  let minBlocks =
  {
    "statusBlock": 0,
    "fundedBlock": 0,
    "beneficiaryBlock": 0,
    "disburseBlock": 0,
    "cfBlock": 0
  };

  res = await promisify(cb => web3.eth.getAccounts(cb));
  defaultAccount = res[0];

  res = await promisify(cb => web3.eth.getGasPrice(cb));
  gasPrice = res;
  gasPrice = Number((new BigNumber(gasPrice)).toString(10));
  defaultTxObj = {
                  from: defaultAccount,
                  gasPrice: gasPrice
                 };

  owner = await instance.owner.call(defaultTxObj);
  console.log("owner: " + owner);

  if (owner === "0x") {

    console.log("Contract does not exist.");
    process.exit();

  } else {
    console.log("Contract exists.");
  }

  balance = await promisify(cb => web3.eth.getBalance(address, cb));
  console.log("Balance: " + balance);
  status = await instance.status.call(defaultTxObj);
  console.log("Status: " + status)
  paymentsOutstanding = await instance.paymentsOutstanding.call(defaultTxObj);
  console.log("Payments Outstanding: " + paymentsOutstanding);
  minFullFundingWei = await instance.minFullFundingWei.call(defaultTxObj);
  console.log("MinFullFundingWei: " + minFullFundingWei);
  minNextPayFundingWei = await instance.minNextPayFundingWei.call(defaultTxObj);
  console.log("MinNextPayFundingWei: " + minNextPayFundingWei);
  fullyFunded = await instance.fullyFunded.call(defaultTxObj);
  console.log("Fully Funded: " + fullyFunded);
  nextPayFunded = await instance.nextPayFunded.call(defaultTxObj);
  console.log("Next Payment Funded: " + nextPayFunded);
  console.log("----------------------------");

  beneficiaryEvent = await instance.BeneficiaryUpdated.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  statusEvent = await instance.StatusUpdated.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  prom = watchEvents([beneficiaryEvent, statusEvent], ["beneficiary", "status"], minBlocks);

  txHash = await instance.setBeneficiary.sendTransaction(
                                               "0xe10de7722c2304f6a9452a21464214dab49ff257",
                                               {
                                                 from: defaultAccount,
                                                 gasPrice: gasPrice
                                               });

  txHash = await prom;
  console.log("Beneficiary minBlock: " + minBlocks["beneficiaryBlock"]);
  console.log("Status minBlock: " + minBlocks["statusBlock"]);
  console.log("----------------------------");

  statusEvent = await instance.StatusUpdated.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  fundingEvent = await instance.FundingChanged.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  prom = watchEvents([statusEvent, fundingEvent], ["status", "funded"], minBlocks);

  txHash = await instance.fund.sendTransaction({
                                                 from: defaultAccount,
                                                 value: 2,
                                                 gasPrice: gasPrice
                                               });

  txHash = await prom;

  balance = await promisify(cb => web3.eth.getBalance(address, cb));
  console.log("Balance: " + balance);
  console.log("Status minBlock: " + minBlocks["statusBlock"]);
  console.log("Funded minBlock: " + minBlocks["fundedBlock"]);
  console.log("----------------------------");

  statusEvent = await instance.StatusUpdated.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  fundingEvent = await instance.FundingChanged.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  prom = watchEvents([statusEvent, fundingEvent], ["status", "funded"], minBlocks);

  txHash = await instance.fund.sendTransaction({
                                                 from: defaultAccount,
                                                 value: 1,
                                                 gasPrice: gasPrice
                                               });

  txHash = await prom;

  balance = await promisify(cb => web3.eth.getBalance(address, cb));
  console.log("Balance: " + balance);
  console.log("Status minBlock: " + minBlocks["statusBlock"]);
  console.log("Funded minBlock: " + minBlocks["fundedBlock"]);
  console.log("----------------------------");

  disburseEvent = await instance.DisbursementsTriggered.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  cfEvent = await instance.CFremaining.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  fundingEvent = await instance.FundingChanged.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  statusEvent = await instance.StatusUpdated.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  prom = watchEvents([disburseEvent, cfEvent, fundingEvent, statusEvent], ["disburse", "cf", "funded", "status"], minBlocks);

  txHash = await instance.ping.sendTransaction({
                                                 from: defaultAccount,
                                                 gasPrice: gasPrice
                                               });

  txHash = await prom;
  console.log("CF minBlock: " + minBlocks["cfBlock"]);
  console.log("Disburse minBlock: " + minBlocks["disburseBlock"]);
  console.log("Funded minBlock: " + minBlocks["disburseBlock"]);
  console.log("Status minBlock: " + minBlocks["statusBlock"]);
  // txHash = await watchEvents([statusEvent], ["status"], minBlocks);

  callback(e);
};
