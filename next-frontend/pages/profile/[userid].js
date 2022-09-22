import Head from 'next/head'
import Link from 'next/link'
import styles from '../../styles/dynamic.dashboard.module.css'
import '../../styles/profile.module.css'
import { Layout } from '../../components/Layout'

import { PreferenceTable } from '../../components/PreferenceTable'

import { useEffect, useState } from 'react'
import styled from 'styled-components'


export default function Profile({userid}) { //({ activesales, userid }) {


    const prefapi = `/api/readprosumerpref/${userid}`

    const [reload, setReload] = useState(false)
    const [preferences, setPreferences] = useState(null)

    const [form_timeblock, setTimeblock] = useState(0)
    const [form_kwh, setKwh] = useState(0)
    const [form_price, setPrice] = useState(0)
    const [form_error, setError] = useState(null)

    var didfetchpreferences = preferences !== null

    console.log("Fetch user preferences: " + didfetchpreferences )
    
    

    useEffect(()=>{

        const fetchPrefData = async () => {
            const res = await fetch(prefapi)
            const payload = await res.text()
            console.log(res)
            const data = JSON.parse(payload)
        

            if (Object.keys(data).length === 0 || typeof data === 'undefined') {
                console.log(Object.keys(data).length)
                setPreferences(null)
            }

            setPreferences( data )
        }

        setPreferences(null)
        fetchPrefData()// make sure to catch any error
            .catch(console.error);

        
    }, [userid, reload, prefapi] )

    const formsubmit = async (e) => {
        e.preventDefault()
        const res = fetch(`/api/setprosumerpref/${userid}?hourblock=${form_timeblock}&maxkwh=${form_kwh}&price=${form_price}`)
        await res
        setReload(!reload)
    }

    return (
        <div className={styles.prosumercolorscheme}>
            <Layout userid={userid}>
                <div className={styles.footer}>
                    <Link href={`/dashboard/${userid}`}><button className={styles.reload}>&#9728; Dashboard</button></Link>
                </div>
                <div className={styles.bodygrid}>
                    
                    
                        {/* <div className={styles.reload} onClick={() => {setReload(!reload)}}>reload</div> */}
                    <div className={styles.sales}>
                        <h3 >Create/Update Offer:</h3>
                        <form className={styles.form} onSubmit={formsubmit}>
                            <div>
                                <label for="timeblock">Time: </label>
                                <select value={form_timeblock} onChange={(e) => setTimeblock(e.target.value)} name="timeblock">
                                    <option value="0">00:00</option>
                                    <option value="1">01:00</option>
                                    <option value="2">02:00</option>
                                    <option value="3">03:00</option>
                                    <option value="4">04:00</option>
                                    <option value="5">05:00</option>
                                    <option value="6">06:00</option>
                                    <option value="7">07:00</option>
                                    <option value="8">08:00</option>
                                    <option value="9">09:00</option>
                                    <option value="10">10:00</option>
                                    <option value="11">11:00</option>
                                    <option value="12">12:00</option>
                                    <option value="13">13:00</option>
                                    <option value="14">14:00</option>
                                    <option value="15">15:00</option>
                                    <option value="16">16:00</option>
                                    <option value="17">17:00</option>
                                    <option value="18">18:00</option>
                                    <option value="19">19:00</option>
                                    <option value="20">20:00</option>
                                    <option value="21">21:00</option>
                                    <option value="22">22:00</option>
                                    <option value="23">23:00</option>
                                </select>
                            </div>
                            <div>
                                <label for="kwh">kWh available: </label>
                                <input step='.01' type='number' value={form_kwh} onChange={(e) => setKwh(e.target.value)} name="kwh" />
                            </div>
                            <div>
                                <label for="price">Price: $</label>
                                <input step='.1' type='number' value={form_price} onChange={(e) => setPrice(e.target.value)} name="price" />
                                <label for="price">/kWh</label>
                            </div>
                            <button type="submit">Submit</button>
                        </form>
                        {form_error}
                    </div>
                    
                    <div className={styles.sales}>
                    {didfetchpreferences ? 
                        <>
                            { Object.keys(preferences.prefs).map((keyName, i) => ( // preferences.prefs.forEach( e => {
                                preferences.prefs[keyName].price > 0 && preferences.prefs[keyName].maxkwh > 0 ?
                                <form className={styles.prefcard}>
                                    <h2>Time: {preferences.prefs[keyName].prefhour}:00</h2>
                                    <div>
                                        <h4>{preferences.prefs[keyName].maxkwh} kWh available </h4> 
                                        <h3>@ ${preferences.prefs[keyName].price}/kWh</h3>
                                    </div>
                                    
                                </form>
                                : <></>
                                
                            ) )}
                        </>
                        : <div>Loading...</div>
                    }
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





