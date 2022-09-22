import * as path from 'path';
import * as fs from 'fs';

var _ = require('lodash');

var express = require('body-parser');

const { Gateway, Wallets } = require('fabric-network');


export async function evaluateTransaction(req, res, userid, contractname, func){

  const walletPath = path.join(process.cwd(), `hyperledger/p${userid}`);
  const connectionProfilePath = (`${walletPath}/connection.json`);
  const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

  try {
    // Create a new gateway for connecting to the peer node.
    const gateway = new Gateway();
    const wallet = await Wallets.newFileSystemWallet(walletPath)

    const connectionOptions = { wallet, identity: `p${userid} Admin`, discovery: { enabled: true, asLocalhost: true } };
    
    await gateway.connect(connectionProfile, connectionOptions);
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(`c${userid}`);
    // Get the contract from the network.
    const contract = network.getContract('EnergyChainMaster', contractname);

    // Print & submit the specified transaction.
    console.log(`Evaluating ${[func]}`)
    const result = await contract.evaluateTransaction(func, []);

    if (result === null) {
      res.send({'error': 500})
      return
    }

    // Send API response
    const payload = result.toString()
    res.send(payload)

    console.log(`\n${typeof result} Transaction has been evaluated, result is: ${JSON.parse(result.toString())}`);
    console.log(`\n${typeof payload} Payload evaluated as ${JSON.parse(payload).sale1}`);

    gateway.disconnect();

  } catch (error) {
    console.error('API failed to fetch:',error);
    res.send({'error': 500})
  }
}