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

// Use to change world state
export async function submitTransaction(req, res, userid, contractname, func, args) {

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

      console.log(identity)
  
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
      res.send(200)

      gateway.disconnect();

  } catch (error) {
      console.error('Simulation failed to submit to DL',error)
  }
}