let BigNumber = require("./bignumber.js");
let BinStack = artifacts.require("BinStack");
let promisify = require("./promisify.js");
let watchEvents = require("./watch_events.js");

module.exports = async (callback) => {

  let e = null;
  let address = "0xfeed1a725ecf3a3266371dae592720b07f454774";
  let instance = BinStack.at(address);
  let defaultAccount, defaultTxObj, txHash, gasPrice;
  let res, owner, status, beneficiary, maturity, cashflowDates;
  let payoff, strike, minFullFundingWei;
  let fullyFunded, paymentsOutstanding;
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
  fullyFunded = await instance.fullyFunded.call(defaultTxObj);
  console.log("Fully Funded: " + fullyFunded);
  strike = await instance.strikeWei.call(defaultTxObj);
  console.log("Strike: " + strike);
  payoff = await instance.payoffAmountWei.call(defaultTxObj);
  console.log("Payoff: " + payoff);
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
  prom = watchEvents([statusEvent, fundingEvent], ["status", "fundedOnetime"], minBlocks);

  txHash = await instance.fund.sendTransaction({
                                                 from: defaultAccount,
                                                 value: 202,
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
  prom = watchEvents([statusEvent, fundingEvent], ["status", "fundedOnetime"], minBlocks);

  txHash = await instance.fund.sendTransaction({
                                                 from: defaultAccount,
                                                 value: 398,
                                                 gasPrice: gasPrice
                                               });

  txHash = await prom;

  balance = await promisify(cb => web3.eth.getBalance(address, cb));
  console.log("Balance: " + balance);
  console.log("Status minBlock: " + minBlocks["statusBlock"]);
  console.log("Funded minBlock: " + minBlocks["fundedBlock"]);
  console.log("----------------------------");

  disburseEvent = await instance.DisbursementsTriggered.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  fundingEvent = await instance.FundingChanged.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  statusEvent = await instance.StatusUpdated.call(defaultTxObj, { fromBlock: 'latest', toBlock: 'pending' });
  prom = watchEvents([disburseEvent, fundingEvent, statusEvent], ["disburseOnetime", "fundedOnetime", "status"], minBlocks);

  txHash = await instance.ping.sendTransaction({
                                                 from: defaultAccount,
                                                 gasPrice: gasPrice
                                               });

  txHash = await prom;
  console.log("Disburse minBlock: " + minBlocks["disburseBlock"]);
  console.log("Funded minBlock: " + minBlocks["fundedBlock"]);
  console.log("Status minBlock: " + minBlocks["statusBlock"]);
  // txHash = await watchEvents([statusEvent], ["status"], minBlocks);

  callback(e);
};
