import { useEffect } from 'react';
import { useRouter } from 'next/router'


export default function Dashboard() { //({ activesales, userid }) {
    const router = useRouter()
    useEffect(() => {
        // const {pathname} = Router
        // if(pathname == '/' ){
            router.push('/dashboard/gsa')
        // }
      });
    // return router.push('')
}