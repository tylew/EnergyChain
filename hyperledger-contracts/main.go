/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	energyAssetContract := new(EnergyAssetContract)
	prosumerPrefContract := new(ProsumerPrefContract)
	generationContract := new(GenerationContract)

	chaincode, err := contractapi.NewChaincode(prosumerPrefContract, energyAssetContract, generationContract)
	chaincode.Info.Title = "Documents chaincode"
	chaincode.Info.Version = "0.0.1"

	// if err != nil {
	// 	panic("Could not create chaincode from ProsumerPrefContract." + err.Error())
	// }

	err = chaincode.Start()

	if err != nil {
		panic("Failed to start chaincode. " + err.Error())
	}

}
