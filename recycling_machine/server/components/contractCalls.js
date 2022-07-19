const tronWeb = require('../contract/tronWeb');
const { getCurrentBalance, restartSession } = require('./bottlesReceiver');

const GateApi = require('gate-api');
const client = new GateApi.ApiClient();
const api = new GateApi.SpotApi(client);
const opts = {
  'currencyPair': "TRX_USD"
};

getTRXUSDPrice = async () => {
  console.log("Getting TRX_USD price...");
  try {
    response = await api.listTickers(opts);
    console.log('API called successfully. Returned data: ', response.body);
    return (response.body[0].last);
  } catch (error) {
    console.error(error);
  }
  return 0;
}

async function getRecyclingMachineContract() {
  let res;
  try {
    res = await tronWeb.contract().at(process.env.NILE_RECYCLING_MACHINE_ADDRESS);
    console.log(res);
  } catch (e) {
    console.log(e);
  }
  return res;
}

module.exports = function (app) {

  app.get('/checkTrxBalance', async (req, res) => {
    const recyclingMachineContract = await getRecyclingMachineContract();
    if (!recyclingMachineContract) {
      res.send("Network error");
      return;
    }
    console.log("Checking TRX balance!");
    const balance = await recyclingMachineContract.checkTrxBalance().call();
    console.log("Balance:", balance);
    res.send(balance);
  });

  app.get('/checkUsdtBalance', async (req, res) => {
    const recyclingMachineContract = await getRecyclingMachineContract();
    if (!recyclingMachineContract) {
      res.send("Network error");
      return;
    }
    console.log("Checking USDT balance!");
    const balance = await recyclingMachineContract.checkUsdtBalance().call();
    console.log("Balance:", balance);
    res.send(balance);
  });

  app.post('/withdraw', async (req, res) => {
    const recyclingMachineContract = await getRecyclingMachineContract();
    if (!tronWeb || !recyclingMachineContract) {
      res.send("Network error");
      return;
    }
    try {
      await recyclingMachineContract.withdraw().send({
        feeLimit: 100_000_000,
        callValue: 0,
        shouldPollResponse: true
      });
      res.send("Success!");
    } catch (err) {
      console.log(err.message);
      res.send(err.message);
    }
  });

  app.get('/getTrxUsdPrice', async (req, res) => {
    tokenPrice = await getTRXUSDPrice();
    res.send(tokenPrice);
  });

  app.post('/payOut', async (req, res) => {
    try {
      const recyclingMachineContract = await getRecyclingMachineContract();
      console.log("Payout...", getCurrentBalance());
      if (!tronWeb || !recyclingMachineContract) {
        res.send("Network error");
        return;
      }

      const tokenPrice = await getTRXUSDPrice();

      let amount = /*getCurrentBalance()*/ 100 / 100;
      if (!req.body.isStableCoin) {
        amount = (amount / tokenPrice).toFixed(6);
      }
      console.log("Amount");
      console.log(amount);

      let ret = await recyclingMachineContract.payOut(req.body.receiver, amount * 1000000, req.body.isStableCoin).send({
        feeLimit: 100_000_000,
        callValue: 0,
        shouldPollResponse: true
      });
      console.log(ret);
      console.log("Payment completed successfully");
      res.send("Payment completed successfully!");
      restartSession();
    } catch (err) {
      console.log(err.message);
      res.send("Payment failed, try again!");
    }
  });

  app.post('/donate', async (req, res) => {
    try {
      const recyclingMachineContract = await getRecyclingMachineContract();
      console.log("Adding donation:", getCurrentBalance(), "[cents]");
      const tokenPrice = await getTRXUSDPrice();
      const amount = (/*getCurrentBalance()*/ 100 / 100 / tokenPrice).toFixed(6);
      await recyclingMachineContract.donate(amount * 1000000).send({
        feeLimit: 100_000_000,
        callValue: 0,
        shouldPollResponse: true
      });
      console.log("Donation completed successfully");
      res.send("Thank you for your donation!");
      restartSession();
    } catch (err) {
      console.log(err.message);
      res.send("Donation failed, try again!");
    }
  });
}
