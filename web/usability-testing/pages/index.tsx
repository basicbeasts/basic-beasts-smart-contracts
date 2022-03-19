import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Basic Beasts Usability Testing</title>
        <meta name="description" content="Frontend for usability testing of smart contracts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Usability Testing<br/>For Smart Contracts</h1>

      <main className={styles.main}>
        
      </main>
    </div>
  )
}

export default Home
