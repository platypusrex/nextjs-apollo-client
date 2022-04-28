import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { ApolloQueryResult, useQuery } from '@apollo/client';
import { getServerSideApolloProps } from '../../lib/apollo';
import { BOOKS_QUERY, USER_QUERY } from '../../gql';
import { BooksQuery, UserQuery, UserQueryVariables } from '../../types/generated';
import styles from '../../styles/Home.module.css'

interface ProfilePageProps {
  userId: string;
}

const ProfilePage: NextPage<ProfilePageProps> = ({ userId }) => {
  const { data: userData } = useQuery<UserQuery, UserQueryVariables>(USER_QUERY, {
    variables: { id: userId }
  });

  const { data: booksData } = useQuery<BooksQuery>(BOOKS_QUERY);

  const user = userData?.user;
  const books = booksData?.books;

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/example/public/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Link href="/">
          <a className={styles.card}>Back to Users</a>
        </Link>

        <div className={styles.pageGrid}>
          {user && (
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardImageContainer}>
                  <Image src={user.img} objectFit="cover" layout="fill" />
                </div>
                <h2>{user.firstName} {user.lastName}</h2>
                <div className={styles.cardUserInfo}>
                  <strong>Username</strong>
                  <p>{user.username}</p>
                </div>
                <div className={styles.cardUserInfo}>
                  <strong>Email</strong>
                  <p>{user.email}</p>
                </div>
                <div className={styles.cardUserInfo}>
                  <strong>Phone</strong>
                  <p>{user.phone}</p>
                </div>
              </div>
            </div>
          )}
          <div className={styles.bookGrid}>
            {books?.map(book => (
              <div className={styles.card}>
                <h2>{book.title}</h2>
                <p>{book.author}</p>
                <p></p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export const getServerSideProps = getServerSideApolloProps<ProfilePageProps>({
  hydrateQueries: ['user', 'books'],
  onHydrationComplete: ({ results }) => {
    const result: ApolloQueryResult<UserQuery> | undefined = results?.find(result => result.data.user);

    if (!result?.data.user) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    return {
      props: {
        userId: result.data.user.id,
      }
    }
  }
})

export default ProfilePage
