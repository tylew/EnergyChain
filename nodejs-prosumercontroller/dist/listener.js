"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fabric_network_1 = require("fabric-network");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
async function main() {
    prosumercontroller('0000');
    prosumercontroller('0001');
    prosumercontroller('0002');
}
async function prosumercontroller(userid) {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `hyperledger/p${userid}`);
        const wallet = await fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        // Create a new gateway for connecting to our peer node.
        const gateway = new fabric_network_1.Gateway();
        const connectionProfilePath = path.join(process.cwd(), `hyperledger/p${userid}/connection.json`);
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8')); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const connectionOptions = { wallet, identity: `p${userid} Admin`, discovery: { enabled: true, asLocalhost: true } };
        await gateway.connect(connectionProfile, connectionOptions);
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(`c${userid}`);
        // Get the contract from the network.
        const contract = network.getContract('EnergyChainMaster', 'EnergyAssetContract');
        // Listen for myEvent publications
        const listener = async (event) => {
            var _a, _b, _c;
            // if (event.eventName === 'hour-completed') {
            //   console.log( 'chaincodeId: ', event.chaincodeId , ' eventName: ' , event.eventName , ' payload: ' , event.payload?.toString());
            // }
            // console.log(event)
            console.log('chaincodeId: ', event.chaincodeId, ' eventName: ', event.eventName, ' payload: ', (_a = event.payload) === null || _a === void 0 ? void 0 : _a.toString());
            if (event.eventName === 'new-sale') {
                let assetid = 'ea' + JSON.parse((_b = event.payload) === null || _b === void 0 ? void 0 : _b.toString()).date + JSON.parse((_c = event.payload) === null || _c === void 0 ? void 0 : _c.toString()).time_block;
                // let assetid: string[] = [event.payload?.toString()] 
                await contract.submitTransaction('ProsumerInitialAgreement', assetid);
                console.log(`Prosumer ${userid} agreed to asset`, assetid);
            }
        };
        const finished = false;
        await contract.addContractListener(listener);
        console.log('Listening for myEvent events...');
        while (!finished) {
            await sleep(5000);
            // ... do other things
        }
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
void main();
//# sourceMappingURL=listener.js.map