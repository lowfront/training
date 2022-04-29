import type { GetServerSideProps, NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from "next/link"
import { getSession } from "next-auth/react"
import { Session } from 'next-auth'

const Home: NextPage<{session?: Session}> = ({}) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  console.log('session', session);

  return (
    <header>
    <noscript>
      <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
    </noscript>
    <div className={styles.signedInStatus}>
      <p
        className={`nojs-show ${
          !session && loading ? styles.loading : styles.loaded
        }`}
      >
        {!session && (
          <>
            <span className={styles.notSignedInText}>
              You are not signed in
            </span>
            <a
              href={`/api/auth/signin`}
              className={styles.buttonPrimary}
              onClick={(e) => {
                e.preventDefault()
                signIn()
              }}
            >
              Sign in
            </a>

            <a
              href={``}
              className={styles.buttonPrimary}
              onClick={(e) => {
                e.preventDefault()
                signOut()
              }}
            >
              Sign Out
            </a>
          </>
        )}
        {session?.user && (
          <>
            {session.user.image && (
              <span
                style={{ backgroundImage: `url('${session.user.image}')` }}
                className={styles.avatar}
              />
            )}
            <span className={styles.signedInText}>
              <small>Signed in as</small>
              <br />
              <strong>{session.user.email ?? session.user.name}</strong>
            </span>
            <a
              href={`/api/auth/signout`}
              className={styles.button}
              onClick={(e) => {
                e.preventDefault()
                signOut()
              }}
            >
              Sign out
            </a>
          </>
        )}
      </p>
    </div>
    <nav>
      <ul className={styles.navItems}>
        <li className={styles.navItem}>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/client">
            <a>Client</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/server">
            <a>Server</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/protected">
            <a>Protected</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/api-example">
            <a>API</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/admin">
            <a>Admin</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/me">
            <a>Me</a>
          </Link>
        </li>
      </ul>
    </nav>
  </header>
  )
}

export default Home

// export const getServerSideProps: GetServerSideProps = async function (ctx) {
//   const session = await getSession(ctx);
  
//   return {
//     props: {
//       session
//     },
//   };
// }