import styles from '../styles/dynamic.dashboard.module.css'

export function Generation({userid, data}) {

    const months = {
        "01": "January",
        "02": "February",
        "03": "March",
        "04": "April",
        "05": "May",
        "06": "June",
        "07": "July",
        "08": "August",
        "09": "September",
        "10": "October",
        "11": "November",
        "12": "December"
    }

    const ppa = {
        "0000": .32,
        "0002": .30
    }
    // ex: 
    // console.log(months["01"])
    
    if(Object.keys(data).length > 0 && Object.keys(data)[0] !== 'error') {
        console.log("------------------")
        console.log(Object.keys(data)[0])
        return (
            <>
                PPA Price: {ppa[userid]}
                {Object.keys(data).map((keyName, i) => (
                    <ul>
                        <div>
                            {months[keyName.substring(2,4)]}
                        </div>
                        <div>
                            Price: ${data[keyName].ppaprice}
                            <br/>Total kWh purchased: {data[keyName].totalkwh}
                        </div>
                    </ul>
                ))}
            </>
        )
    } else {
        return (<div>Nothing to show.</div>)
    }
  }