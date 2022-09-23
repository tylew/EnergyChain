/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

// ProsumerPref stores a value
type ProsumerPref struct {
	// Key is always "prosumer-pref" -- 1 pref per channel

	// ProsumerID string `json:"prosumerID"`
	Email string `json:"email"`

	Prefs [24]Pref `json:"prefs"` // Pref array, length 24 for each hour in day
}

type Pref struct { // One such entry per hour
	Hour   int     `json:"prefhour"`
	Maxkwh float32 `json:"maxkwh"`
	Price  float32 `json:"price"`
}
