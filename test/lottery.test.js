const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());


const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async() => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data: bytecode})
  .send({from: accounts[0], gas: '1000000'})
});


describe('Lottery Contract', () => {
  // Deploy The Contract
  it('Deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  // Add a player to the lottery
  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });


  // Add multiple players to the lottery
  it('allows multiple account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  // Make sure that not enough funds fails
  it('requires a min amount of ether to enter', async ()=> {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 10
      });
      assert(false);
    } catch (err){
      assert(err);
    }
  });

  it('non manager can not call pickWinner', async () => {
    try{
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    }catch(err){
      assert(err);
    }
  });

  it('sends money to winner and resets contract', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    const init_balance = await web3.eth.getBalance(accounts[0]);

    const lottery_has_balance = await web3.eth.getBalance(lottery.options.address) > 0;
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const final_balance = await web3.eth.getBalance(accounts[0]);

    const difference = final_balance - init_balance;
    console.log("Difference between start and final is:", difference);
    assert(difference > web3.utils.toWei('.99', 'ether'));

    const lottery_balance =  await web3.eth.getBalance(lottery.options.address);
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });
    const player_count = players.length;

    assert(lottery_has_balance);
    assert.equal(lottery_balance, 0);
    assert.equal(player_count, 0);

  });
});
