/*
 * Tyler Lewis
 * IEEE 2022
 * Energy Chain Project
 * tyler@clean-coalition.org
 */

package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const gsa_MSPID string = "gsaMSP"
const gsa_name string = "ElectriqPower"

const prosumer_id string = "0"

// EnergyAssetContract contract for managing CRUD for EnergyAsset
type EnergyAssetContract struct {
	contractapi.Contract
}

// IsGSA checks the MSPID of current identity interacting with contact
func (c *EnergyAssetContract) IsGSA(ctx contractapi.TransactionContextInterface) (bool, error) {
	str1, err := ctx.GetClientIdentity().GetMSPID()

	if err != nil {
		return false, err
	}
	if str1 == gsa_MSPID {
		return true, nil
	}

	return false, nil
}

func (c *EnergyAssetContract) WhatMSP(ctx contractapi.TransactionContextInterface) (string, error) {
	return ctx.GetClientIdentity().GetMSPID()
}

func (c *EnergyAssetContract) EmitMessage(ctx contractapi.TransactionContextInterface, _eventname string, _message string) error {
	// Publish event all nodes on blockchain
	return ctx.GetStub().SetEvent(_eventname, []byte(_message))
}

// EnergyAssetExists returns true when asset with given ID exists in world state
func (c *EnergyAssetContract) EnergyAssetExists(ctx contractapi.TransactionContextInterface, energyAssetID string) (bool, error) {
	data, err := ctx.GetStub().GetState(energyAssetID)

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

// CreateEnergyAsset creates a new instance of EnergyAsset
func (c *EnergyAssetContract) CreateEnergyAsset(ctx contractapi.TransactionContextInterface,
	_date string,
	_time_block int,
	_kwh, _price float32) error {
	// Only runable by GSA, assets should only be created by the overarching authority offering the agreements
	gsa_bool, gsa_err := c.IsGSA(ctx)

	if gsa_bool {
		energyAssetID := "ea" + _date + strconv.Itoa(_time_block)
		exists, err := c.EnergyAssetExists(ctx, energyAssetID)

		if err != nil {
			return fmt.Errorf("Could not read from world state. %s", err)
		} else if exists {
			return fmt.Errorf("The agreement '%s' already exists", energyAssetID)
		} else if _time_block >= 24 {
			return fmt.Errorf("The time block '%v' is invalid", _time_block)
		}
		// new energyAsset instance
		energyAsset := new(EnergyAsset)
		// const vars
		energyAsset.Gsa = gsa_name
		energyAsset.ProsumerID = fmt.Sprintf("household-%v", prosumer_id)
		// function arguments
		energyAsset.Date = _date
		energyAsset.Time_block = _time_block
		energyAsset.Kwh = _kwh
		energyAsset.Price = _price
		// Default values
		energyAsset.Prosumer_agreement = false
		energyAsset.Prosumer_denial = false
		energyAsset.Prosumer_transfer_energy = false
		energyAsset.Gsa_final = false

		// Marshal data for DL
		bytes, _ := json.Marshal(energyAsset)

		// Publish event to prosumer, notify of new EnergyAsset
		err = ctx.GetStub().SetEvent("new-sale", bytes)

		if err != nil {
			return fmt.Errorf("There was an issue emitting a notification to the prosumer %s", err)
		}

		return ctx.GetStub().PutState(energyAssetID, bytes)

	}

	return fmt.Errorf("You are not the GSA organization. Access prohibited %s", gsa_err)
}

// ProsumerInitialAgreement called by prosumer client to indicate contract agreement
func (c *EnergyAssetContract) ProsumerInitialAgreement(ctx contractapi.TransactionContextInterface, energyAssetID string) error {
	// Only runable by Prosumer
	gsa_bool, gsa_err := c.IsGSA(ctx)
	if gsa_bool {
		return fmt.Errorf("This function is limited to the Prosumer %s", gsa_err)
	}

	exists, err := c.EnergyAssetExists(ctx, energyAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The agreement '%s' does not exist", energyAssetID)
	}

	energyAsset := new(EnergyAsset)
	bytes, _ := ctx.GetStub().GetState(energyAssetID)
	err = json.Unmarshal(bytes, energyAsset)

	// Various checks regarding order of confirmations
	if energyAsset.Prosumer_agreement == true {
		return fmt.Errorf("The agreement '%s' has already been agreed to by the Prosumer", energyAssetID)
	}
	if energyAsset.Gsa_final == true {
		return fmt.Errorf("The agreement '%s' has already been indicated as finalized by the GSA", energyAssetID)
	}
	if energyAsset.Prosumer_denial == true {
		return fmt.Errorf("The agreement '%s' has already been denied by the prosumer and cannot be re-instantiated", energyAssetID)
	}

	energyAsset.Prosumer_agreement = true

	newVal, _ := json.Marshal(energyAsset)

	// Publish event to gsa, notify of agreement
	err = ctx.GetStub().SetEvent("prosumer-agreement", []byte(energyAssetID))

	return ctx.GetStub().PutState(energyAssetID, newVal)
}

// ProsumerTransferEnergyConfirmation called by prosumer client to indicate energy has been transfered
func (c *EnergyAssetContract) ProsumerTransferEnergyConfirmation(ctx contractapi.TransactionContextInterface, energyAssetID string) error {
	// Unly runable by Prosumer
	gsa_bool, gsa_err := c.IsGSA(ctx)
	if gsa_bool {
		return fmt.Errorf("This function is limited to the Prosumer %s", gsa_err)
	}

	exists, err := c.EnergyAssetExists(ctx, energyAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The agreement '%s' does not exist", energyAssetID)
	}

	energyAsset := new(EnergyAsset)
	bytes, _ := ctx.GetStub().GetState(energyAssetID)
	err = json.Unmarshal(bytes, energyAsset)

	// Various checks regarding order of confirmations
	if energyAsset.Prosumer_agreement != true {
		return fmt.Errorf("The agreement '%s' has not yet been agreed to by the Prosumer. \n Run function ProsumerTransferEnergyConfirmation first", energyAssetID)
	}
	if energyAsset.Gsa_final == true {
		return fmt.Errorf("The agreement '%s' has already been indicated as finalized by the GSA", energyAssetID)
	}
	if energyAsset.Prosumer_transfer_energy == true {
		return fmt.Errorf("The agreement '%s' has already been indicated as completed by the Prosumer", energyAssetID)
	}
	if energyAsset.Prosumer_denial == true {
		return fmt.Errorf("The agreement '%s' has already been denied by the prosumer and cannot be re-instantiated", energyAssetID)
	}

	energyAsset.Prosumer_transfer_energy = true

	newVal, _ := json.Marshal(energyAsset)

	// Publish event to gsa, notify of new energy transfer
	err = ctx.GetStub().SetEvent("prosumer-transfer", []byte(energyAssetID))

	return ctx.GetStub().PutState(energyAssetID, newVal)
}

// GSATransferEnergyConfirmation is for GSA to indicate energy transfer has been verified, finalize DL entry
func (c *EnergyAssetContract) GSATransferEnergyConfirmation(ctx contractapi.TransactionContextInterface, energyAssetID string) error {
	// Only runable by GSA check
	gsa_bool, gsa_err := c.IsGSA(ctx)
	if !gsa_bool {
		return fmt.Errorf("This function is limited to the GSA authority %s", gsa_err)
	}

	exists, err := c.EnergyAssetExists(ctx, energyAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The agreement '%s' does not exist", energyAssetID)
	}

	// Create new placeholder EnergyAsset struct, replace outdated DL entry
	energyAsset := new(EnergyAsset)
	bytes, _ := ctx.GetStub().GetState(energyAssetID)
	err = json.Unmarshal(bytes, energyAsset)

	if energyAsset.Prosumer_agreement != true {
		return fmt.Errorf("The agreement '%s' has not yet been agreed to by the Prosumer. \n Prosumer must run function ProsumerTransferEnergyConfirmation first", energyAssetID)
	}
	if energyAsset.Gsa_final == true {
		return fmt.Errorf("The agreement '%s' has already been indicated as finalized by the GSA", energyAssetID)
	}
	if energyAsset.Prosumer_denial == true {
		return fmt.Errorf("The agreement '%s' has already been denied by the prosumer and cannot be re-instantiated", energyAssetID)
	}

	energyAsset.Gsa_final = true

	newVal, _ := json.Marshal(energyAsset)

	// Publish event to prosumer, notify of new EnergyAsset
	err = ctx.GetStub().SetEvent("gsa-final", []byte(energyAssetID))

	return ctx.GetStub().PutState(energyAssetID, newVal)
}

// GSATransferEnergyConfirmation is for GSA to indicate energy transfer has been verified, finalize DL entry
func (c *EnergyAssetContract) ProsumerDenial(ctx contractapi.TransactionContextInterface, energyAssetID string) error {
	// Only runable by GSA check
	gsa_bool, gsa_err := c.IsGSA(ctx)
	if gsa_bool {
		return fmt.Errorf("This function is limited to the prosumer %s", gsa_err)
	}

	exists, err := c.EnergyAssetExists(ctx, energyAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The agreement '%s' does not exist", energyAssetID)
	}

	// Create new placeholder EnergyAsset struct, replace outdated DL entry
	energyAsset := new(EnergyAsset)
	bytes, _ := ctx.GetStub().GetState(energyAssetID)
	err = json.Unmarshal(bytes, energyAsset)

	if energyAsset.Gsa_final == true {
		return fmt.Errorf("The agreement '%s' has already been indicated as finalized by the GSA", energyAssetID)
	}
	if energyAsset.Prosumer_agreement == true {
		return fmt.Errorf("The agreement '%s' has already been agreed to by the Prosumer. \n Cannot deny a confirmed agreement", energyAssetID)
	}
	if energyAsset.Prosumer_denial == true {
		return fmt.Errorf("The agreement '%s' has already been denied by the prosumer and cannot be re-instantiated", energyAssetID)
	}

	energyAsset.Prosumer_denial = true

	newVal, _ := json.Marshal(energyAsset)

	// Publish event to prosumer, notify of new EnergyAsset
	err = ctx.GetStub().SetEvent("prosumer-denial", []byte(energyAssetID))

	return ctx.GetStub().PutState(energyAssetID, newVal)
}

// ReadEnergyAsset retrieves an instance of EnergyAsset from the world state
func (c *EnergyAssetContract) ReadEnergyAsset(ctx contractapi.TransactionContextInterface, energyAssetID string) (*EnergyAsset, error) {
	exists, err := c.EnergyAssetExists(ctx, energyAssetID)
	if err != nil {
		return nil, fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return nil, fmt.Errorf("The agreement '%s' does not exist", energyAssetID)
	}

	// Retrieve DL entry provided energyAssetID (key)
	bytes, _ := ctx.GetStub().GetState(energyAssetID)

	energyAsset := new(EnergyAsset)
	err = json.Unmarshal(bytes, energyAsset)

	if err != nil {
		return nil, fmt.Errorf("Could not unmarshal world state data to type EnergyAsset")
	}

	return energyAsset, nil
}

// AllEnergyAssets retrieves all EnergyAsset in world state
func (c *EnergyAssetContract) AllEnergyAssets(ctx contractapi.TransactionContextInterface) (map[string]*EnergyAsset, error) {
	ledgerIterator, err := ctx.GetStub().GetStateByRange("ea", "ea12319923") // The maximum id number (would need reset after year 2099)
	if err != nil {
		return nil, err
	}
	defer ledgerIterator.Close()

	// Map all EnergyAssets to their keys for usability
	m := make(map[string]*EnergyAsset)
	for ledgerIterator.HasNext() {
		queryResponse, err := ledgerIterator.Next()
		if err != nil {
			return nil, err
		}

		var EA EnergyAsset

		err = json.Unmarshal(queryResponse.Value, &EA)
		if err != nil {
			return nil, err
		}
		m[queryResponse.Key] = &EA
	}

	return m, nil
}

func (s *EnergyAssetContract) AllHistoricalEnergyAssets(ctx contractapi.TransactionContextInterface) (map[string]*EnergyAsset, error) {
	ledgerIterator, err := ctx.GetStub().GetStateByRange("ea", "ea12319923") // The maximum id number (would need reset after year 2099)
	if err != nil {
		return nil, err
	}
	defer ledgerIterator.Close()

	// Map all EnergyAssets to their keys for usability
	m := make(map[string]*EnergyAsset)
	for ledgerIterator.HasNext() {
		queryResponse, err := ledgerIterator.Next()
		if err != nil {
			return nil, err
		}

		var EA EnergyAsset

		err = json.Unmarshal(queryResponse.Value, &EA)
		if err != nil {
			return nil, err
		}
		if EA.Gsa_final == true { // only include finalized assets
			m[queryResponse.Key] = &EA
		}
	}

	return m, nil
}

func (s *EnergyAssetContract) AllUnconfirmedEnergyAssets(ctx contractapi.TransactionContextInterface) (map[string]*EnergyAsset, error) {
	ledgerIterator, err := ctx.GetStub().GetStateByRange("ea", "ea12319923") // The maximum id number (would need reset after year 2099)
	if err != nil {
		return nil, err
	}
	defer ledgerIterator.Close()

	// Map all EnergyAssets to their keys for usability
	m := make(map[string]*EnergyAsset)
	for ledgerIterator.HasNext() {
		queryResponse, err := ledgerIterator.Next()
		if err != nil {
			return nil, err
		}

		var EA EnergyAsset

		err = json.Unmarshal(queryResponse.Value, &EA)
		if err != nil {
			return nil, err
		}
		if EA.Prosumer_agreement == false && EA.Prosumer_denial == false { // only include unconfirmed assets
			m[queryResponse.Key] = &EA
		}
	}

	return m, nil
}

func (s *EnergyAssetContract) AllActiveEnergyAssets(ctx contractapi.TransactionContextInterface) (map[string]*EnergyAsset, error) {
	ledgerIterator, err := ctx.GetStub().GetStateByRange("ea", "ea12319923") // The maximum id number (would need reset after year 2099)
	if err != nil {
		return nil, err
	}
	defer ledgerIterator.Close()

	// Map all EnergyAssets to their keys for usability
	m := make(map[string]*EnergyAsset)
	for ledgerIterator.HasNext() {
		queryResponse, err := ledgerIterator.Next()
		if err != nil {
			return nil, err
		}

		var EA EnergyAsset

		err = json.Unmarshal(queryResponse.Value, &EA)
		if err != nil {
			return nil, err
		}
		if EA.Gsa_final == false && EA.Prosumer_denial == false && EA.Prosumer_agreement == true {
			m[queryResponse.Key] = &EA
		}
	}

	return m, nil
}

// DeleteEnergyAsset deletes an instance of EnergyAsset from the world state
func (c *EnergyAssetContract) DeleteEnergyAsset(ctx contractapi.TransactionContextInterface, energyAssetID string) error {
	exists, err := c.EnergyAssetExists(ctx, energyAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The agreement '%s' does not exist", energyAssetID)
	}

	return ctx.GetStub().DelState(energyAssetID)
}

// DeleteAllEnergyAssets deletes all instances of EnergyAsset from the world state
func (c *EnergyAssetContract) DeleteAllEnergyAssets(ctx contractapi.TransactionContextInterface) error {
	ledgerIterator, err := ctx.GetStub().GetStateByRange("ea", "ea12319923") // The maximum id number (would need reset after year 2099)
	if err != nil {
		return err
	}
	defer ledgerIterator.Close()

	// Map all EnergyAssets to their keys for usability
	// m := make(map[string]*EnergyAsset)
	for ledgerIterator.HasNext() {
		queryResponse, err := ledgerIterator.Next()
		if err != nil {
			return err
		}
		// Delete all DL entries by key
		ctx.GetStub().DelState(queryResponse.Key)
	}

	return nil
}
