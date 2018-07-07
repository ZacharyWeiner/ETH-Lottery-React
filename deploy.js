const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
  'shiver wasp despair evidence this labor tornado egg beach inner cotton prosper',
  "https://rinkeby.infura.io/Vs8ZUQ3NWrIAXRcLkmlp"
  );


const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  const result = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data: bytecode, arguments: []})
  .send({gas: '1000000', from: accounts[0]})

  console.log("Deployed To", result.options.address)

};

deploy();
