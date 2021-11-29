const {Blockchain, Transaction} = require('./RoboCoin');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.keyFromPrivate('a294cf48f0599cb1d647eba90326f0c64da699bf29acd026c136dec21a62c73b');
const walletAddress = key.getPublic('hex');

let robocoin = new Blockchain();
const tx1 = new Transaction(walletAddress, 'here', 20);
tx1.signTransaction(key);
robocoin.addTransaction(tx1);

console.log('Mining block....');
robocoin.minePendingTransactions(walletAddress);
console.log('My balance is', robocoin.getBalance(walletAddress));
