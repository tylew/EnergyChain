import { Gateway, Wallets, ContractListener } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  prosumercontroller('0000')
  prosumercontroller('0001')
  prosumercontroller('0002')
}

async function prosumercontroller(userid: string) {
  try {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), `hyperledger/p${userid}`);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    const connectionProfilePath = path.join(process.cwd(), `hyperledger/p${userid}/connection.json`);
    const connectionProfile: any = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8')); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    const connectionOptions = { wallet, identity: `p${userid} Admin`, discovery: { enabled: true, asLocalhost: true }};
    await gateway.connect(connectionProfile, connectionOptions);

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(`c${userid}`);

    // Get the contract from the network.
    const contract = network.getContract('EnergyChainMaster','EnergyAssetContract');

    // Listen for myEvent publications
    const listener: ContractListener = async (event) => {    // eslint-disable-line @typescript-eslint/require-await
      // if (event.eventName === 'hour-completed') {
      //   console.log( 'chaincodeId: ', event.chaincodeId , ' eventName: ' , event.eventName , ' payload: ' , event.payload?.toString());
      // }
      // console.log(event)
      console.log( 'chaincodeId: ', event.chaincodeId , ' eventName: ' , event.eventName , ' payload: ' , event.payload?.toString());

      
      if (event.eventName === 'new-sale') {
        let assetid: string = 'ea' + JSON.parse(event.payload?.toString()!).date + JSON.parse(event.payload?.toString()!).time_block
        // let assetid: string[] = [event.payload?.toString()] 
        await contract.submitTransaction('ProsumerInitialAgreement', assetid)
        console.log(`Prosumer ${userid} agreed to asset`, assetid)
      }
    };

    const finished = false;
    await contract.addContractListener(listener);

    console.log('Listening for myEvent events...');
    while (!finished) {
      await sleep(5000);
      // ... do other things
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

void main();
