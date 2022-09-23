/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"github.com/hyperledger/fabric-contract-api-go/contractapi"

	"encoding/json"
	"fmt"
)

// GenerationContract contract for managing CRUD for Generation struct
type GenerationContract struct {
	contractapi.Contract
}

func (c *GenerationContract) GenerationExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	data, err := ctx.GetStub().GetState(id)

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

func (c *GenerationContract) CreateGeneration(ctx contractapi.TransactionContextInterface,
	_month string, _year int, _totalkwh float32, _ppaprice float32) error {

	id := fmt.Sprintf("ge%s%v", _month, _year)
	exists, err := c.GenerationExists(ctx, id)

	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The generation record %s already exist for ", "prosumer-pref")
	}

	generation := new(Generation)
	generation.Totalkwh = _totalkwh
	generation.Ppaprice = _ppaprice

	bytes, _ := json.Marshal(generation)

	return ctx.GetStub().PutState(id, bytes)
}

func (c *GenerationContract) AllGeneration(ctx contractapi.TransactionContextInterface) (map[string]*Generation, error) {
	ledgerIterator, err := ctx.GetStub().GetStateByRange("ge", "ge1299") // The maximum id number (would need reset after year 2099)
	if err != nil {
		return nil, err
	}
	defer ledgerIterator.Close()

	// Map all Generation entries to their keys for usability in front-end
	m := make(map[string]*Generation)
	for ledgerIterator.HasNext() {
		queryResponse, err := ledgerIterator.Next()
		if err != nil {
			return nil, err
		}

		var GE Generation

		err = json.Unmarshal(queryResponse.Value, &GE)
		if err != nil {
			return nil, err
		}
		m[queryResponse.Key] = &GE
	}

	return m, nil
}

func (c *GenerationContract) DeleteGeneration(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := c.GenerationExists(ctx, id)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The generation '%s' does not exist", id)
	}

	return ctx.GetStub().DelState(id)
}
