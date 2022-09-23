import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/gsa.module.css'

import { EnergyAsset } from '../../components/EnergyAsset'
import { GSALayout } from '../../components/gsaLayout'


import { useEffect, useState } from 'react'

const baseurl = 'http://localhost:3001'
const http = require('http');



// async function fetcherFunction (key) {
//     var res = await fetch(key)  //.then(r => r.json())
//     var payload = await res.text()
//     return JSON.parse(payload)
// }

// const fetcher = (key) => fetch(key).then(r => r.json)

const nexthour = () => {
    // try {
    fetch('http://localhost:4004/nexthour').catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
}

const resetsim = () => {
    // try {
    fetch('http://localhost:4004/initledger').catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
}

export default function Dashboard({userid}) { //({ activesales, userid }) {
    return (
        <div className={styles.gsacolorscheme}>
            <GSALayout>
                <div className={styles.container}>
                    <div className={styles.simcontrol}>
                        <div className={styles.dropdown}>
                            <button>View prosumer dashboard by ID#</button>
                            <div className={styles.dropdowncontent}>
                                <a href="/dashboard/0000">0000</a>
                                <a href="/dashboard/0001">0001</a>
                                <a href="/dashboard/0002">0002</a>
                            </div>
                        </div>
                        <div>
                            <button onClick={() => nexthour()}>Next hour</button>
                        </div>
                        <div>
                            <button onClick={() => resetsim()}>Reset simulation</button>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.reload} >reload</button>
                </div>
            </GSALayout>
        </div>
    )
}