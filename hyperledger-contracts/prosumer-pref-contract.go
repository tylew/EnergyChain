/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"github.com/hyperledger/fabric-contract-api-go/contractapi"

	"encoding/json"
	"fmt"
	// "strconv"
)

// ProsumerPrefContract contract for managing CRUD for ProsumerPref
type ProsumerPrefContract struct {
	contractapi.Contract
}

// ProsumerPrefExists returns true when asset with given ID exists in world state
func (c *ProsumerPrefContract) ProsumerPrefExists(ctx contractapi.TransactionContextInterface) (bool, error) {
	data, err := ctx.GetStub().GetState("prosumer-pref")

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

// CreateProsumerPref creates a new instance of ProsumerPref
// Single entry per Prosumer
// Modified upon user request
// in: gsa (string), prosumerid (string), email (string)
// out: error
func (c *ProsumerPrefContract) CreateProsumerPref(ctx contractapi.TransactionContextInterface) error {
	exists, err := c.ProsumerPrefExists(ctx)

	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The preferences %s already exist for ", "prosumer-pref")
	}

	prosumerPref := new(ProsumerPref)

	for i := 0; i < 24; i++ {
		prosumerPref.Prefs[i].Hour = i
	}

	bytes, _ := json.Marshal(prosumerPref)

	return ctx.GetStub().PutState("prosumer-pref", bytes)
}

// ReadProsumerPref retrieves an instance of ProsumerPref from the world state
func (c *ProsumerPrefContract) ReadProsumerPref(ctx contractapi.TransactionContextInterface) (*ProsumerPref, error) {
	exists, err := c.ProsumerPrefExists(ctx)

	if err != nil {
		return nil, fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		// c.CreateProsumerPref(ctx)
		return nil, fmt.Errorf("The asset %s does not exist,", "prosumer-pref")
	}

	bytes, _ := ctx.GetStub().GetState("prosumer-pref")

	prosumerPref := new(ProsumerPref)

	err = json.Unmarshal(bytes, prosumerPref)

	if err != nil {
		return nil, fmt.Errorf("Could not unmarshal world state data to type ProsumerPref")
	}

	return prosumerPref, nil
}

// ReadProsumerPref retrieves a single hour entry within a ProsumerPref from the world state
func (c *ProsumerPrefContract) ReadProsumerPrefHour(ctx contractapi.TransactionContextInterface, hour int) (*Pref, error) {
	exists, err := c.ProsumerPrefExists(ctx)

	if err != nil {
		return nil, fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		// c.CreateProsumerPref(ctx)
		return nil, fmt.Errorf("The asset %s does not exist,", "prosumer-pref")
	}

	bytes, _ := ctx.GetStub().GetState("prosumer-pref")

	prosumerPref := new(ProsumerPref)

	err = json.Unmarshal(bytes, prosumerPref)

	if err != nil {
		return nil, fmt.Errorf("Could not unmarshal world state data to type ProsumerPref")
	}

	return &prosumerPref.Prefs[hour], nil
}

// UpdatePrefHour retrieves an instance of ProsumerPref from the world state and updates its value
func (c *ProsumerPrefContract) UpdatePrefHour(ctx contractapi.TransactionContextInterface,
	_hour int,
	_maxkwh, _price float32) error {

	if !(_hour >= 0 && _hour < 24) { // invalid time block, return error
		return fmt.Errorf("Invalid time block. %v is not valid", _hour)
	}

	exists, err := c.ProsumerPrefExists(ctx)

	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		// c.CreateProsumerPref(ctx)
		return fmt.Errorf("The asset %s does not exist,", "prosumer-pref")
	}

	bytes, _ := ctx.GetStub().GetState("prosumer-pref")

	prosumerPref := new(ProsumerPref)
	err = json.Unmarshal(bytes, prosumerPref)

	if err != nil {
		return fmt.Errorf("Could not unmarshal world state data to type ProsumerPref")
	}

	hourPref := new(Pref)
	hourPref.Hour = _hour
	hourPref.Maxkwh = _maxkwh
	hourPref.Price = _price

	// prosumerPref := new(ProsumerPref)
	prosumerPref.Prefs[_hour] = *hourPref
	bytes, _ = json.Marshal(prosumerPref)

	return ctx.GetStub().PutState("prosumer-pref", bytes)
}

// UpdatePrefEmail retrieves an instance of ProsumerPref from the world state and updates its value
func (c *ProsumerPrefContract) UpdatePrefEmail(ctx contractapi.TransactionContextInterface,
	_email string) error {

	exists, err := c.ProsumerPrefExists(ctx)

	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		// c.CreateProsumerPref(ctx)
		return fmt.Errorf("The asset %s does not exist,", "prosumer-pref")
	}

	bytes, _ := ctx.GetStub().GetState("prosumer-pref")

	prosumerPref := new(ProsumerPref)
	err = json.Unmarshal(bytes, prosumerPref)

	if err != nil {
		return fmt.Errorf("Could not unmarshal world state data to type ProsumerPref")
	}

	prosumerPref.Email = _email

	bytes, _ = json.Marshal(prosumerPref)

	return ctx.GetStub().PutState("prosumer-pref", bytes)
}

// // DeleteProsumerPref deletes an instance of ProsumerPref from the world state
// func (c *ProsumerPrefContract) DeleteProsumerPref(ctx contractapi.TransactionContextInterface, prosumerPrefID string) error {
// 	exists, err := c.ProsumerPrefExists(ctx, prosumerPrefID)
// 	if err != nil {
// 		return fmt.Errorf("Could not read from world state. %s", err)
// 	} else if !exists {
// 		return fmt.Errorf("The asset %s does not exist", prosumerPrefID)
// 	}

// 	return ctx.GetStub().DelState(prosumerPrefID)
// }
