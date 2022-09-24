const path = require('path');
const fs = require('fs');
const http = require('http');

const express = require('express');
const { Gateway, Wallets, ContractListener } = require('fabric-network');
const { Certificate } = require('crypto');
const { map } = require('lodash');
const app = express();
const starthour = 18 // Time 0
const startdate = 1019 // October 19
const startyear = 22 // 2022






async function main() {
    console.log("hello")
    prosumercontroller('0000')
    prosumercontroller('0002')
    prosumercontroller('0001')

}

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


async function prosumercontroller(userid) {
    const current_ea = []
    
    try {
        const body = await httpGet('http://console.127.0.0.1.nip.io:8080/ak/api/v1/components');
    
        const body_json = await JSON.parse(body)

        const rawgateway = find_in_object(body_json, { type: 'gateway', wallet: `p${userid}` })
        const gatewayConnection = rawgateway[0]
        
        const rawidentity = find_in_object(body_json, { type: 'identity', id: `p${userid}admin` })
        const rawcert = rawidentity[0].cert
        const rawprivatekey = rawidentity[0].private_key

        const certificate = Buffer.from(rawcert, 'base64').toString();
        const privateKey = Buffer.from(rawprivatekey, 'base64').toString();
        const credentials = { certificate, privateKey }

        const identityLabel = `p${userid} Admin`;
        const identity = {
            credentials,
            mspId: `p${userid}MSP`,
            type: 'X.509',
        };
        console.log(identity)

        // Create a new gateway for connecting to the peer node.
        const gateway = new Gateway();
        // Create wallet instance used to interact with DL
        const wallet = await Wallets.newInMemoryWallet()
        wallet.put(identityLabel, identity) 

        const connectionOptions = { wallet, identity: `p${userid} Admin`, discovery: { enabled: true, asLocalhost: true } };
        
        // Make connection
        await gateway.connect(gatewayConnection, connectionOptions);
        const network = await gateway.getNetwork(`c${userid}`); // Get the network (channel) our contract is deployed to.
        const EnergyAssetContract = network.getContract('EnergyChainMaster', 'EnergyAssetContract'); // Get the contract from the network.


        // const listener = new ContractEventListener(contract,`p${userid}listener`,'hello',()=>console.log("heeelo"))
        // await contract.addContractListener(listener)

        const listener = async (event) => {
            if (event.eventName === 'new-sale') {
                const assetid = 'ea' + JSON.parse(event.payload).date + JSON.parse(event.payload).time_block
                console.log("> INCOMING NEW SALE EVENT: id#" + assetid)
                
                await EnergyAssetContract.submitTransaction('ProsumerInitialAgreement', assetid)
                console.log(`Prosumer ${userid} agreed to asset`, assetid)
                current_ea.push(assetid)
            }

            if (event.eventName === 'hour-completed') {
                const assetid = event.payload.toString()
                console.log(`User: ${userid} Current asset id `, assetid)
                console.log(`Current agreements:\n`,current_ea)
                if ( current_ea.includes(assetid) ) {
                    await EnergyAssetContract.submitTransaction('ProsumerTransferEnergyConfirmation', assetid)
                }
            }
        }


        EnergyAssetContract.addContractListener(listener)

    } catch (error) {
        console.error('Simulation failed to submit to DL',error)
    }
}




// Use for query only, cannot change world state
async function EvaluateTransaction(userid, contractname, func, args) {
    try {
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
    
        // Print & submit the specified transaction.
        console.log(`${userid} Evaluating ${[func]}`)
        const result = await contract.evaluateTransaction(func, ...args);
    
        if (result === null) {
            console.log("Error evaluating DL")
          return
        }

        console.log(`Successful response from 'EvaluateTransaction'. Submitting: ${func} on ${contractname} with args`, args);
    
        gateway.disconnect();
        // Send API response
        return JSON.parse(result.toString())
    
    } catch (error) {
        console.error('Simulation failed to query DL', error)
        // res.send(error?.message)
      }
}

void main();