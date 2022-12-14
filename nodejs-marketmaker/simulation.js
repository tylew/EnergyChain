const path = require('path');
const fs = require('fs');
const http = require('http');

const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const { Certificate } = require('crypto');
const app = express();
const starthour = 18 // Time 0
const startdate = 1019 // October 19
const startyear = 22 // 2022





class prosumerpreference {
    constructor(maxkwh, price) {
        this.maxkwh = maxkwh
        this.price = price
    }
}
class sale {
    constructor(userid,kwh) {
        this.userid = userid
        this.kwh = kwh
    }

    set changekwh(kwh) {
        this.kwh = kwh
    }
}
const prosumerids = ['0000','0001','0002']
var prosumerpreferencemap //= new Map();

const gsapreferences = JSON.parse( fs.readFileSync('gsapreferences.json') )
console.log(gsapreferences)

var hour = starthour
var date = startdate
var year = startyear
var gsaavailablekwh
var maxprice

app.get('/nexthour', (req, res) => {
    nextHour(req,res)
});

app.get('/allenergyassets/:id', (req, res) => {
    AllEnergyAssets(req,res)
});

app.get('/allenergyassets/', (req, res) => {
    // Invalid call
    res.sendStatus(500)
});


app.get('/initledger/', (req, res) => {
    hour = starthour
    date = startdate
    year = startyear
    ClearLedger();
    res.sendStatus(200)
});

app.get('/submitNewAgreement/', (req, res) => {
    // Invalid call
    submitNewAgreement('0000', '0913', '22', '20', 5, 0.2);
    res.sendStatus(200)
});




app.listen(4004, () => console.log('Application started on port 4004'));




// function InitLedger(id) {
//     SubmitTransaction(id, 'EnergyAssetContract', 'CreateEnergyAsset', ['091022',20,5,.2])
// }

async function nextHour(req,res) {
    // emit completion of previous hour
    await hourCompleted()

    hour = hour + 1
    if( hour == 24){
        date += 1
        hour = 0
    }
    
    // matchOffers() -> 
    // Retrieve prosumer preferences
    // Determine ## kWh and prive avail.
    // Submit new agreements
    await matchOffers()

    res.send(`<p>Offer matching complete</p>Current time block: <b>${date}${year}-${hour}</b>`)
}
async function submitNewAgreement(userid, _date, _year, _timeblock, _kwh, _price) { //  date -> MMDDYY,  timeblock -> [# 1-23]
    SubmitTransaction(userid, 'EnergyAssetContract', 'CreateEnergyAsset', [`${_date}${_year}`, _timeblock,_kwh, _price])
}

async function UpdateProsumerPreference() {
    prosumerpreferencemap = new Map()
    var totalkwh = 0

    for (const i in prosumerids) {
        const userid = prosumerids[i]
        // _pref = Prosumer Preference object from DL 
        const _pref = await EvaluateTransaction(userid,'ProsumerPrefContract','ReadProsumerPrefHour',[hour])
        if (_pref) { 
            console.log("pref",_pref)
            if (_pref.maxkwh > 0 && _pref.price > 0) {
                prosumerpreferencemap.set(userid,new prosumerpreference(_pref.maxkwh,_pref.price))
                totalkwh += _pref.maxkwh
            }
        } else {
            console.log("missing pref for prosumer id#", userid)
        }
    }
    console.log('\n', totalkwh, "kWh on offer by prosumers for hour", hour)
    
}

// Emit message to site controllers that an hour has been completed ... (sim purposes)
async function hourCompleted() {
    for (const i in prosumerids) {
        const eaid =  `ea${date}${year}${hour}`
        const userid = prosumerids[i]
        await SubmitTransaction(userid,'EnergyAssetContract','EmitMessage', ['hour-completed', eaid])
    }
    console.log("Notified prosumers of completed hour!")
}

async function matchOffers() {

    // Read GSA available kWh & price from file
    gsaavailablekwh = gsapreferences[`${hour}`].maxkwh
    if (gsaavailablekwh > 0) {
        maxprice = gsapreferences[`${hour}`].maxprice
    } else {
        maxprice = null
    }

    // Update prosumer pref mapping
    await UpdateProsumerPreference()

    if (prosumerpreferencemap.size == 0) {
        console.log("\nGSA available kWh: ", gsaavailablekwh, " hour:", hour, " max price:", maxprice)
        console.log("-- no available kWh by Prosumer")
        return
    } else if (gsaavailablekwh <= 0) {
        console.log("\nhour:", hour)
        console.log("-- no available kWh by GSA")
        return
    }

    while (gsaavailablekwh > 0 && prosumerpreferencemap.size > 0) {
        var minoffer = null
        var nextsale = []

        console.log("\nGSA available kWh: ", gsaavailablekwh, " hour:", hour, " max-price:", maxprice)
        console.log('--',prosumerpreferencemap)

        prosumerpreferencemap.forEach((value, key)=>{ // Fill prosumerpreferencemap with available prosumers and prefs
            if (minoffer != null) {
                if (value.price < minoffer) {
                    nextsale = []
                    nextsale.push(new sale(key, value.maxkwh))
                    minoffer = value.price
                } else if (value.price == minoffer) {
                    nextsale.push(new sale(key, value.maxkwh))
                }
            } else {
                nextsale.push(new sale(key, value.maxkwh))
                minoffer = value.price
            }
        })

        nextsale.every((item) => {
            console.log(item)
            if(item.kwh <= gsaavailablekwh) {
                console.log(item.userid,date,year,hour,item.kwh,minoffer)

                submitNewAgreement(item.userid,date,year,hour,item.kwh,minoffer)
                gsaavailablekwh = gsaavailablekwh - item.kwh
                prosumerpreferencemap.delete(item.userid) // remove from map so it doesnt get multiple identical offers
                // console.log()
            } else if (item.kwh > gsaavailablekwh) {
                submitNewAgreement(item.userid,date,year,hour,item.kwh,minoffer)
                gsaavailablekwh = 0
                return false // stop loop
            }
            return true
        })
    }

}

async function AllEnergyAssets(req,res) {
    const payload = await EvaluateTransaction(req.params.id, 'EnergyAssetContract', 'AllEnergyAssets', [])
    res.send(payload)
    console.log(payload)
}

async function ClearLedger() {
    for (const i in prosumerids) {
        const userid = prosumerids[i]
        await SubmitTransaction(userid,'EnergyAssetContract','DeleteAllEnergyAssets', [])
        // await SubmitTransaction(userid,'ProsumerPrefContract','CreateProsumerPref',[])
    }
    console.log("Cleared DL for all prosumers!")
}







// Hyperledger functions -- Submit, Evaluate

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
async function SubmitTransaction(userid, contractname, func, args) {
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