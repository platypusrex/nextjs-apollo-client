import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { useQuery } from '@apollo/client';
import { getServerSideApolloProps } from '../lib/apollo';
import { generateUsers } from '../mocks';
import { CREATE_USER, USERS_QUERY } from '../gql';
import {
  CreateUserMutation,
  CreateUserMutationVariables,
  UserFragment,
  UserQueryVariables,
  UsersQuery
} from '../types/generated';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ users }) => {
  console.log('users from server side hydration', users);
  const { data } = useQuery<UsersQuery, UserQueryVariables>(USERS_QUERY);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/example/public/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>User List</h1>

        <Link href="/create-user">
          <a className={styles.cardLink}>Create User</a>
        </Link>

        <div className={styles.grid}>
          {data?.users?.map((user) => (
            <Link
              href={{ pathname: '/profile/[userId]', query: { userId: user.id } }}
              key={user.id}
            >
              <a className={styles.cardLink}>
                <h2 style={{ margin: 0 }}>{user.firstName} {user.lastName}</h2>
              </a>
            </Link>
          ))}
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

export const getServerSideProps = getServerSideApolloProps<{ users?: UserFragment[] | null }>({
  hydrateQueries: ['users'],
  onClientInitialized: async (ctx, apolloClient) => {
    if (ctx.query.addUser) {
      const { firstName, lastName, username, email, phone } = generateUsers(1)[0];
      await apolloClient.mutate<CreateUserMutation, CreateUserMutationVariables>({
        mutation: CREATE_USER,
        variables: {
          input: {
            firstName,
            lastName,
            username,
            email,
            phone,
          },
        },
      });

      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    return { props: {} };
  },
  onHydrationComplete: ({ users }) => {
    return {
      props: {
        users: users?.data.users ?? null
      },
    };
  },
});

export default Home;
