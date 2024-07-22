const MockUSDT = artifacts.require("MockUSDT");
const PublicDebt = artifacts.require("PublicDebt");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(MockUSDT);
  const usdtInstance = await MockUSDT.deployed();
  const usdtAddress = usdtInstance.address;

  const recipientAccount = accounts[1];
  const amountToTransfer = 1000 * 10**6; // 1000 USDT con 6 decimales

  await usdtInstance.transfer(recipientAccount, amountToTransfer);

  const name = "Public Debt Token";
  const symbol = "PDT";
  const debtAmount = 250000 * (10 ** 6); // 1,000,000 USDT with 6 decimals
  const interestRate = 5; // 5%
  const duration = 365 * 24 * 60 * 60; // 1 year in seconds

  console.log(`USDT addrs ${usdtAddress}`);
  console.log(`Transferred ${amountToTransfer} USDT to ${recipientAccount}`);

  await deployer.deploy(PublicDebt, name, symbol, usdtAddress, debtAmount, interestRate, duration);
};
