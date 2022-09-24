import styles from '../styles/dynamic.dashboard.module.css'
import clipboardy from 'clipboardy'
import { map } from 'lodash'

export function EnergyAsset({sales}) {
    
        if(Object.keys(sales).length > 0 && Object.keys(sales)[0] !== 'error') {
            console.log("------------------")
            console.log(Object.keys(sales)[0])
            const assetkeys = new Map()
            Object.keys(sales).map((keyName, i) => (
                assetkeys.set(keyName, '')
            ))

            function displayassets() {
                assetkeys.forEach((value, keyName) => {
                    <div>
                        {/* {Object.keys(sales).filter(e => e.)} */}
                    </div>
                })
            }

            return (
                Object.keys(sales).map((keyName, i) => (

                    
                
                    <li className={styles.card} key={i}>
                        
                        <div>
                            <h3>{breakid(keyName)}</h3>

                            <button className={styles.objectLabel} onClick={() => clipboardy.write(keyName)}>
                                ID: {keyName} 
                                <div className={styles.tooltip}> copy </div>
                            </button>

                        </div>
                        <div className={styles.statscontainer}>
                            <div className={styles.stats}>
                            {/* <li className='gsa-label'>GSA: {sales[keyName].gsa}</li> */}
                            {/* <li className='prosumer-id'>Prosumer ID: {sales[keyName].prosumerID}</li> */}
                            {/* <li className='time-block'> Time block: {sales[keyName].time_block}:00</li> */}
                                <div >{sales[keyName].kwh} kWh</div>
                                <div >For ${sales[keyName].price}/kWh</div>
                            </div>
                            <div className={styles.boolean}>
                                <Boolean bool={sales[keyName].prosumer_agreement} className={styles.booleans}>Prosumer agreement</Boolean> 
                                <Boolean bool={sales[keyName].prosumer_transfer_energy} className={styles.booleans}>Energy tranfer indication</Boolean> 
                                <Boolean bool={sales[keyName].gsa_final} className={styles.booleans}>GSA validation</Boolean> 

                                {/* <div className={styles.booleans} style={sales[keyName].prosumer_transfer_energy ? "color: green;" : "color:red;"}>Energy tranfer indication: {sales[keyName].prosumer_transfer_energy.toString()}</div> */}
                                {/* <div className={styles.booleans}>GSA validation: {sales[keyName].gsa_final.toString()}</div> */}
                            </div>
                        </div>
                    </li>
                ))
            )
        } else {
            return (<div>Nothing to show.</div>)
        }
  }

  function breakid(id) {
    var chararray = id.split('')

    return <>
        {chararray[2]}{chararray[3]}/{chararray[4]}{chararray[5]}/20{chararray[6]}{chararray[7]} @ {chararray[8]}{chararray[9] ? chararray[9] : ''}:00
    </>
  } 

function Boolean(props) {
    const { bool } = props
    console.log(bool)
    if (bool) {
        return (
            <div className={styles.white}>&radic; {props.children}</div>
        )
    }        
    
    return (
        <div className={styles.red}>&rArr; {props.children}</div>
    )
}