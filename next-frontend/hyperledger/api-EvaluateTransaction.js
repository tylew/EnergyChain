import * as path from 'path';
import * as fs from 'fs';

var _ = require('lodash');
const http = require('http');

var express = require('body-parser');

const { Gateway, Wallets } = require('fabric-network');

const httpGet = url => {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      res.setEncoding('utf8');
      let body = ''; 
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
};

function find_in_object(my_object, my_criteria){

  return my_object.filter(function(obj) {
    return Object.keys(my_criteria).every(function(c) {
      return obj[c] == my_criteria[c];
    });
  });

}


export async function evaluateTransaction(req, res, userid, contractname, func){

  // const walletPath = path.join(process.cwd(), `hyperledger/p${userid}`);
  // const connectionProfilePath = (`${walletPath}/connection.json`);
  // const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

  // try {
  //   // Create a new gateway for connecting to the peer node.
  //   const gateway = new Gateway();
  //   const wallet = await Wallets.newFileSystemWallet(walletPath)

  //   const connectionOptions = { wallet, identity: `p${userid} Admin`, discovery: { enabled: true, asLocalhost: true } };
    
  //   await gateway.connect(connectionProfile, connectionOptions);
  //   // Get the network (channel) our contract is deployed to.
  //   const network = await gateway.getNetwork(`c${userid}`);
  //   // Get the contract from the network.
  //   const contract = network.getContract('EnergyChainMaster', contractname);

  try {
  // retrieve connection from microfab api
    const body = await httpGet('http://console.127.0.0.1.nip.io:8080/ak/api/v1/components');
    
    const body_json = await JSON.parse(body)

    const rawgateway = find_in_object(body_json, { type: 'gateway', wallet: `gsa` })
    const gatewayConnection = rawgateway[0]
      
    const rawidentity = find_in_object(body_json, { type: 'identity', id: `gsaadmin` })
    const rawcert = rawidentity[0].cert
    const rawprivatekey = rawidentity[0].private_key

    const certificate = Buffer.from(rawcert, 'base64').toString();
    const privateKey = Buffer.from(rawprivatekey, 'base64').toString();
    const credentials = { certificate, privateKey }

    const identityLabel = `gsa Admin`;
    const identity = {
        credentials,
        mspId: `gsaMSP`,
        type: 'X.509',
    };

    // Create a new gateway for connecting to the peer node.
    const gateway = new Gateway();
    // Create wallet instance used to interact with DL
    const wallet = await Wallets.newInMemoryWallet()
    wallet.put(identityLabel, identity) 

    const connectionOptions = { wallet, identity: `gsa Admin`, discovery: { enabled: true, asLocalhost: true } };
    
    // Make connection
    await gateway.connect(gatewayConnection, connectionOptions);
    const network = await gateway.getNetwork(`c${userid}`); // Get the network (channel) our contract is deployed to.
    const contract = network.getContract('EnergyChainMaster', contractname); // Get the contract from the network.

    console.log(`Evaluating ${[func]}`)
    // Use contract object to execute transaction
    const result = await contract.evaluateTransaction(func, []);
    
    // error handling
    if (result === null) {
      res.send({'error': 500})
      return
    }

    // Send API response
    const payload = result.toString()
    res.send(payload)
    console.log(`\n${typeof result} Transaction has been evaluated, result is: ${JSON.parse(result.toString())}`);
    console.log(`\n${typeof payload} Payload evaluated as ${JSON.parse(payload).sale1}`);

    
    // disconnect gateway
    gateway.disconnect();

  } catch (error) {
    console.error('API failed to fetch:',error);
    res.send({'error': 500})
  }
}