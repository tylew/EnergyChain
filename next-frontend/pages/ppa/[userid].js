import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/dynamic.dashboard.module.css'
import { Generation } from '../../components/Generation'


import { SWRConfig } from 'swr'

import { EnergyAsset } from '../../components/EnergyAsset'
import { Layout } from '../../components/Layout'

import { useEffect, useState } from 'react'

export default function PPA({userid}) { //({ activesales, userid }) {


    const[reload, setReload] = useState(false)
    const [generationData, setGenerationData] = useState(null)

    var didfetchgenerationdata = generationData !== null
    console.log("Fetch generation data: " + didfetchgenerationdata)

    useEffect(()=>{
        console.log("USERID", userid)

        const fetchGenerationData = async () => {
            const res = await fetch(`/api/generationdata/${userid}`)
            const payload = await res.text()
            console.log(res)
            const data = JSON.parse(payload)
        

            if (Object.keys(data).length === 0) {
                console.log(Object.keys(data).length)
                setGenerationData(null)
            }

            setGenerationData( data )
        }

        setGenerationData(null)
        fetchGenerationData()// make sure to catch any error
            .catch(console.error);
        
    }, [userid, reload] )


    // function breakid(id) {
    //     var chararray = id.split('')

    //     return <>
    //         {chararray[0]}{chararray[1]}/{chararray[2]}{chararray[3]}/20{chararray[4]}{chararray[5]} @ {chararray[7]}{chararray[8]}:00
    //     </>
    //   } 


    return (
        <div className={styles.prosumercolorscheme}>
            
            <Layout userid={userid}>
                <div className={styles.footer}>
                    <Link href={`/dashboard/${userid}`}><button className={styles.reload}>&#9728; Dashboard</button></Link>
                </div>
            
                <div className={styles.bodygrid}>

                    
                        <div className={styles.sales}>
                            <h2>Historical generation</h2>
                            
                            { didfetchgenerationdata ? 
                                <Generation userid={userid} data={generationData}/>

                                : <div>Loading...</div>}
                        </div>
                    
                </div>

                <div className={styles.footer}>
                    <button className={styles.reload} onClick={() => {setReload(!reload)}}>reload &#8634;</button>
                    <button className={styles.reload} onClick={() => {console.log(generationData)}}>print to console</button>
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










