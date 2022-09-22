import styles from '../styles/dynamic.dashboard.module.css'
import clipboardy from 'clipboardy'

export function PreferenceTable({prefs}) {
    
        // if(Object.keys(prefs).length > 0 && Object.keys(prefs)[0] !== 'error') {
        //     console.log("------------------")
        //     console.log(Object.keys(prefs)[0])
        //     return (
        //         Object.keys(prefs).map((keyName, i) => (

                    
                
        //             <li className={styles.card} key={i}>
        //                 <div>Hour block: {prefs[i].prefhour}:00</div>
        //                 <div>Minimum price: $0{prefs[i].minprice}</div>
        //                 <div>Maximum transfer: {prefs[i].maxkwh}kWh</div>
                        {/* <div>

                            <button className={styles.objectLabel} onClick={() => clipboardy.write(keyName)}>
                                ID: {keyName} 
                                <div className={styles.tooltip}> copy </div>
                            </button>

                        </div> */}
                        {/* <div className={styles.statscontainer}> */}
                            {/* <div className={styles.stats}> */}
                            {/* <li className='gsa-label'>GSA: {sales[keyName].gsa}</li> */}
                            {/* <li className='prosumer-id'>Prosumer ID: {sales[keyName].prosumerID}</li> */}
                            {/* <li className='time-block'> Time block: {sales[keyName].time_block}:00</li> */}
                                {/* <div >{sales[keyName].kwh} kWh</div>
                                <div >For ${sales[keyName].price}/kWh</div> */}
                            {/* </div> */}
                            {/* <div className={styles.boolean}> */}
                                {/* <Boolean bool={sales[keyName].prosumer_agreement} className={styles.booleans}>Prosumer agreement</Boolean>  */}
                                {/* <Boolean bool={sales[keyName].prosumer_transfer_energy} className={styles.booleans}>Energy tranfer indication</Boolean>  */}
                                {/* <Boolean bool={sales[keyName].gsa_final} className={styles.booleans}>GSA validation</Boolean>  */}

                                {/* <div className={styles.booleans} style={sales[keyName].prosumer_transfer_energy ? "color: green;" : "color:red;"}>Energy tranfer indication: {sales[keyName].prosumer_transfer_energy.toString()}</div> */}
                                {/* <div className={styles.booleans}>GSA validation: {sales[keyName].gsa_final.toString()}</div> */}
                            {/* </div> */}
                        {/* </div> */}
            //         </li>
            //     ))
            // )
        // } else {
            return (<div>Nothing to show.</div>)
        // }
  }

  function breakid(id) {
    var chararray = id.split('')

    return <>
        {chararray[0]}{chararray[1]}/{chararray[2]}{chararray[3]}/20{chararray[4]}{chararray[5]} @ {chararray[7]}{chararray[8]}:00
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