import styles from '../styles/gsa.module.css'
import Link from 'next/link'

export function GSALayout({children}) {
    return(
        <>

        <div className={styles.header}>
            <div className={styles.logo}>
                EnergyChain 
                <div className={styles.userid}>GSA Dashboard</div>
            </div>

            {/* <Link href={`/profile/${userid}`} className={styles.user}>
                <div className={styles.user}></div>    
            </Link> */}
        </div>

        {children}
        </>
    )
}