/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

// Generation stores an agregate of one month of energy generation
// Key: geMMYY
type Generation struct {
	Totalkwh float32 `json:"totalkwh"`
	Ppaprice float32 `json:"ppaprice"`
}
