import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
// import styles from '../styles/Home.module.css'
import styles from '../styles/dashboard.module.css'
import clipboardy from 'clipboardy'
import useSWR from 'swr'
import { SWRConfig } from 'swr'

import { useEffect, useState } from 'react'
import styled from 'styled-components'

// async function fetcherFunction (key) {
//     var res = await fetch(key)  //.then(r => r.json())
//     var payload = await res.text()
//     return JSON.parse(payload)
// }

// const fetcher = (key) => fetch(key).then(r => r.json)

export default function Dashboard({ activesales }) {

    var didfetchactivesales = {activesales}.activesales !== null
    console.log("Fetch: " + didfetchactivesales)
    
    // const {sales, error} = useSWR('/api/allactiveenergyassets',(key) => fetch(key).then(r => r.json()))

    // useEffect(()=>{
    //     console.log((sales))
    // }, [sales] )

    // const [salesSanitized, setSalesSanitized] = useState(sales)

    // console.log(salesSanitized)

    function refreshPage() {
      window.location.reload(false);
    }

    function breakid(id) {
        var chararray = id.split('')

        return <>
            {chararray[0]}{chararray[1]}/{chararray[2]}{chararray[3]}/20{chararray[4]}{chararray[5]} @ {chararray[7]}{chararray[8]}:00
        </>
      } 


    return (
        <SWRConfig>
            <div className={styles.header}>
                EnergyChain
                <Link href='/profile' className={styles.user}>
                    <a className={styles.user}></a>
                </Link>
            </div>

            <div className={styles.bodygrid}>
                <ul className={styles.sales}>
                    <h2>Active agreements</h2>
                    {/* {sales ? activeagreements : <div>nothing to show here</div>} */}
                    { didfetchactivesales ? 
                    // <div>hello</div>
                        
                        Object.keys(activesales).map((keyName, i) => (
                        <li className={styles.card} key={i}>
                            
                            <div>
                                <h3>{breakid(keyName)}</h3>

                                <button className={styles.objectLabel} onClick={() => clipboardy.write(keyName)}>
                                    ID: {keyName} 
                                    <div className={styles.tooltip}> copy </div>
                                </button>

                            </div>
                            <div className={styles.stats}>
                                {/* <li className='gsa-label'>GSA: {sales[keyName].gsa}</li> */}
                                {/* <li className='prosumer-id'>Prosumer ID: {sales[keyName].prosumerID}</li> */}
                                {/* <li className='time-block'> Time block: {sales[keyName].time_block}:00</li> */}
                                <div className='kwh'>{activesales[keyName].kwh} kWh</div>
                                <div className='price'>For ${activesales[keyName].price}/kWh</div>
                                {/* <li className='prosumer-agreement'>Prosumer agreement: {activesales[keyName].prosumer_agreement}</li>
                                <li className='prosumer-transfer-energy'>Energy tranfer indication: {activesales[keyName].prosumer_transfer_energy}</li>
                                <li className='gsa-final'>GSA validation: {activesales[keyName].gsa_final}</li> */}
                            </div>
                        </li>
                        ))
                     : <div>nothing to show here</div>}
                </ul>

                <ul className={styles.sales}>
                    <h2>Historical agreements</h2>
                     <div>nothing to show here</div>
                </ul>
                
            </div>

            {/* <button onClick={refreshPage()}>Refresh</button> */}

            {/* <form onSubmit={console.log("Submitted")}>
                Time block 00:00
                <InputBox/>
                <InputBox/>
                <InputBox/>
            </form> */}
        </SWRConfig>
    )

}

export async function getServerSideProps(context) {
    const res = await fetch('http://localhost:3000/api/allenergyassets')
    const payload = await res.text()

    const data = JSON.parse(payload)
    

    if (Object.keys(data).length === 0) {
        console.log(Object.keys(data).length)
        return{  
            props: { activesales: null  }
        };
    }
    return {  
        props: { activesales: data  }
    };
}










