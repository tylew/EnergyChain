/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

// EnergyAsset stores a value

type EnergyAsset struct {

	// Key: eaMMDDYY[Time_block]

	Gsa        string  `json:"gsa"`
	ProsumerID string  `json:"prosumerID"`
	Date       string  `json:"date"`
	Time_block int     `json:"time_block"`
	Kwh        float32 `json:"kwh"`
	Price      float32 `json:"price"`

	Prosumer_agreement       bool `json:"prosumer_agreement"`
	Prosumer_denial          bool `json:"prosumer_denial"`
	Prosumer_transfer_energy bool `json:"prosumer_transfer_energy"`
	Gsa_final                bool `json:"gsa_final"`
}
