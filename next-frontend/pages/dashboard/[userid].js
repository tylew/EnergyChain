import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/dynamic.dashboard.module.css'


import { SWRConfig } from 'swr'

import { EnergyAsset } from '../../components/EnergyAsset'
import { Layout } from '../../components/Layout'

import { useEffect, useState } from 'react'

const baseurl = ''

// async function fetcherFunction (key) {
//     var res = await fetch(key)  //.then(r => r.json())
//     var payload = await res.text()
//     return JSON.parse(payload)
// }

// const fetcher = (key) => fetch(key).then(r => r.json)


export default function Dashboard({userid}) { //({ activesales, userid }) {

    // const userid = () => {
        // const router = useRouter()
        // const userid = router.query.userid
    // }
    // const userid = router.query
    // const userid = '0000'
    // var userid
    // const router = useRouter();
    // useEffect(()=>{
    //     if(!router.isReady) return;

        // const userid = {user}.userid
        

    // }, [router.isReady]);
    
    

    const[reload, setReload] = useState(false)
    const [activeSales, setActiveSales] = useState(null)
    const [historicalSales, setHistoricalSales] = useState(null)
    const [unconfirmedSales, setUnconfirmedSales] = useState(null)
    // const [historicalSales, setSales] = useState(null)

    var didfetchactivesales = activeSales !== null
    var didfetchhistoricalsales = historicalSales !== null
    var didfetchunconfirmedsales = unconfirmedSales !== null
    console.log("Fetch active sales: " + didfetchactivesales)
    console.log("Fetch historical sales: " + didfetchhistoricalsales)
    console.log("Fetch un-confirmed sales: " + didfetchunconfirmedsales)
    
    // const {sales, error} = useSWR('/api/allactiveenergyassets',(key) => fetch(key).then(r => r.json()))
    

    useEffect(()=>{
        console.log("THEUSERID", userid)

        const fetchActiveData = async () => {
            const res = await fetch(`${baseurl}/api/allactiveenergyassets/${userid}`)
            const payload = await res.text()
            console.log(res)
            const data = JSON.parse(payload)
        

            if (Object.keys(data).length === 0) {
                console.log(Object.keys(data).length)
                setActiveSales(null)
            }

            setActiveSales( data )
        }

        setActiveSales(null)
        fetchActiveData()// make sure to catch any error
            .catch(console.error);

        const fetchHistoricalData = async () => {
            const res = await fetch(`${baseurl}/api/allhistoricalenergyassets/${userid}`)
            const payload = await res.text()
            console.log(res)
            const data = JSON.parse(payload)
        

            if (Object.keys(data).length === 0) {
                console.log(Object.keys(data).length)
                setHistoricalSales(null)
            }

            setHistoricalSales( data )
        }

        setHistoricalSales(null)
        fetchHistoricalData()// make sure to catch any error
            .catch(console.error);

        const fetchUnconfrimedSales = async () => {
            const res = await fetch(`${baseurl}/api/allunconfirmedenergyassets/${userid}`)
            const payload = await res.text()
            console.log(res)
            const data = JSON.parse(payload)
        

            if (Object.keys(data).length === 0) {
                console.log(Object.keys(data).length)
                setUnconfirmedSales(null)
            }

            setUnconfirmedSales( data )
        }

        setUnconfirmedSales(null)
        fetchUnconfrimedSales()// make sure to catch any error
            .catch(console.error);
        
    }, [userid, reload] )


    function breakid(id) {
        var chararray = id.split('')

        return <>
            {chararray[0]}{chararray[1]}/{chararray[2]}{chararray[3]}/20{chararray[4]}{chararray[5]} @ {chararray[7]}{chararray[8]}:00
        </>
      } 


    return (
        <div className={styles.prosumercolorscheme}>
            
            <Layout userid={userid}>
                <div className={styles.footer}>
                    <Link href={`/profile/${userid}`}><button className={styles.reload}>Edit offers &#8658;</button></Link>
                </div>
            
                <div className={styles.bodygrid}>

                    
                        <div className={styles.sales}>
                            <h2>Active agreements</h2>
                            
                            { didfetchactivesales ? 
                                <EnergyAsset sales={activeSales}/>

                                : <div>Loading...</div>}
                        </div>

                        <div className={styles.sales}>
                            <h2>Historical agreements</h2>
                            
                            { didfetchhistoricalsales ? 
                            <EnergyAsset sales={historicalSales}/>
                            
                            : <div>Loading...</div>}
                        </div>

                        <div className={styles.sales} keyName={styles.col1}>
                            <h2>Un-confirmed agreements</h2>
                            
                            { didfetchunconfirmedsales ? 
                            <EnergyAsset sales={unconfirmedSales}/>
                            
                            : <div>Loading...</div>}
                        </div>
                    
                </div>

                <div className={styles.footer}>
                    <button className={styles.reload} onClick={() => {setReload(!reload)}}>reload &#8634;</button>
                </div>
            </Layout>
        </div>
    )

}

export async function getServerSideProps(context) {
    const { userid } = context.query

    console.log("userid:",userid)

    return {  
        props: { userid: userid  }
    };
}










