let BigNumber = require("./bignumber.js");
let DummyStack = artifacts.require("DummyStack");

const promisify = (inner) =>
  new Promise((resolve, reject) => {

    inner((err, res) => {

      if (err) { reject(err); }
      resolve(res);
    });
  });

module.exports = async (callback) => {

  let e = null;
  let address = "0xc7280a051f8757097fc6feaa714c02ccc2068e41";
  let instance = DummyStack.at(address);
  let defaultAccount, defaultTxObj;
  let res, byteCode, status, beneficiary, maturity, cashflowDates;
  let cashflows, minFullFundingWei, fullyFunded;

  res = await promisify(cb => web3.eth.getAccounts(cb));
  defaultAccount = res[0];
  defaultTxObj = { from: defaultAccount };

  byteCode = await promisify(cb => web3.eth.getCode(address, cb));
  // console.log(byteCode);

  if ((byteCode === "0x0") || (byteCode === "0x")) {

    console.log("Contract does not exist.");
    process.exit();

  } else {
    console.log("Contract exists.");
  }

  status = await instance.status.call(defaultTxObj);
  console.log("Status: " + status);
  beneficiary = await instance.beneficiary.call(defaultTxObj);
  console.log("Beneficiary: " + beneficiary);
  maturity = await instance.maturity.call(defaultTxObj);
  console.log("Maturity: " + maturity);
  cashflowDates = await instance.cashflowDates.call(defaultTxObj);
  console.log("CashflowDates: " + cashflowDates);

  // cashflowAmountsEth = await instance.cashflowAmountsEth.call(0, defaultTxObj);
  // console.log("CashflowAmountsEth: " + cashflowAmountsEth);
  cashflows = await instance.cashflows.call(defaultTxObj);
  console.log("Cashflows: " + cashflows);

  minFullFundingWei = await instance.minFullFundingWei.call(defaultTxObj);
  console.log("MinFullFundingWei: " + minFullFundingWei);
  fullyFunded = await instance.fullyFunded.call(defaultTxObj);
  console.log("FullyFunded: " + fullyFunded);

  callback(e);
};
