import styles from '../styles/dynamic.dashboard.module.css'
import Link from 'next/link'

export function Layout({children, userid}) {
    return(
        <>

        <div className={styles.header}>
            <div className={styles.logo}>
                EnergyChain 
                <div className={styles.userid}>User ID# {userid}</div>
            </div>

            {/* <Link href={`/profile/${userid}`} className={styles.user}>
                <div className={styles.user}></div>    
            </Link> */}
        </div>

        {children}
        </>
    )
}