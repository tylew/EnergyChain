import * as path from 'path';
import * as fs from 'fs';

var _ = require('lodash');

var express = require('body-parser');

const { Gateway, Wallets } = require('fabric-network');

// Use to change world state
export async function submitTransaction(req, res, userid, contractname, func, args) {

    // try {
    const walletPath = path.join(process.cwd(), `hyperledger/gsa`); // This function uses the GSA wallet <===
    const connectionProfilePath = (`${walletPath}/connection.json`);
    const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
    
    try {
        // const walletPath = path.join(process.cwd(), `hyperledger/gsa`); // This function uses the GSA wallet <===
        // const connectionProfilePath = (`${walletPath}/connection.json`);
        // const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
        // Create a new gateway for connecting to the peer node.
        const gateway = new Gateway();
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        const connectionOptions = { wallet, identity: `gsa Admin`, discovery: { enabled: true, asLocalhost: true } };
        
        await gateway.connect(connectionProfile, connectionOptions);
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(`c${userid}`);
        // Get the contract from the network.
        const contract = network.getContract('EnergyChainMaster', contractname);
    
        // Print & submit the specified transaction.
        console.log(`${userid} Submitting ${func} ${args}`)
        const result = await contract.submitTransaction(func, ...args);
    
        if (result === null) {
          console.log("Error submitting to DL")
          return
        }
        // res.sendStatus(200)
        // Send API response
    
        console.log(`Successful response from 'SubmitTransaction'. Submitting: ${func} on ${contractname} with args`, args);
    
        gateway.disconnect();

    } catch (error) {
        console.error('Simulation failed to submit to DL',error)
      }
}