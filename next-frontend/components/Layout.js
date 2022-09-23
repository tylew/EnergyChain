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
            <div className={styles.dropdown}>
                <button>Menu</button>
                <div className={styles.dropdowncontent}>
                    <Link className={styles.dropdownlink} href={`/dashboard/${userid}`}>Grid service</Link>
                    <Link className={styles.dropdownlink} href={`/ppa/${userid}`}>Generation</Link>
                    <Link className={styles.dropdownlink} href="/dashboard/gsa">Admin control</Link>
                </div>
                
            </div>
            {/* <Link href={`/profile/${userid}`} className={styles.user}>
                <div className={styles.user}></div>    
            </Link> */}
        </div>

        {children}
        </>
    )
}