const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString;
    }

    signTransaction(sign) {
        if (sign.getPublic('hex') !== this.fromAddress) {
            throw new Error('Your signature does not match!');
        }
        const hashTx = this.calculateHash();
        const sig = sign.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if(this.fromAddress === null) {return true;}
        if(this.signature.length === 0 || !this.signature) throw new Error('No signature found!')

        const publickey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publickey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + this.nonce + JSON.stringify(this.transactions)).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined is: '+this.hash);
    }

    validTransactions() {
        for(const tx of this.transactions) {
            if (!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block('01/01/2001', 'Genesis block', '0');
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addMiningReward(balance) {
        balance += this.miningReward;
    }

    minePendingTransactions(miningAddress) {
        
        const rewardTx = new Transaction(null, miningAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);
        let block = new Block(Date.now(), this.pendingTransactions, this.getLastBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block transaction complete');

        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress) throw new Error('Must include to and from address!');
        if(!transaction.isValid()) throw new Error('Transaction is not valid!');
        this.pendingTransactions.push(transaction);
    }

    getBalance(address) {
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid() {
        for(let i = 1; i<this.chain.length; i++){
            currentBlock = this.chain[i];
            prevBlock - this.chain[i-1];

            if(!currentBlock.validTransactions()) return false;
            if(currentBlock.hash !== currentBlock.calculateHash()) return false;
            if(prevBlock.calculateHash() == currentBlock.previousHash) return false;
        }
        return true;
    }
}


module.exports.Transaction = Transaction;
module.exports.Blockchain = Blockchain;