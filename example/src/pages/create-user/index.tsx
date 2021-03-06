import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { object, string, InferType } from 'yup';
import { useForm } from '@platypusrex/react-use-form';
import { useMutation } from '@apollo/client';
import { CreateUserMutation, CreateUserMutationVariables, UsersQuery } from '../../types/generated';
import { CREATE_USER, USERS_QUERY } from '../../gql';
import styles from '../../styles/Home.module.css'

const schema = object({
  firstName: string().required(),
  lastName: string().required(),
  username: string().required(),
  email: string().required().email(),
  phone: string().min(10).max(10),
});

type FormValues = InferType<typeof schema>;

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
}

const CreateUserPage: NextPage = () => {
  const { values, onChange, onSubmit, reset } = useForm<FormValues>({
    initialValues,
    validation: {
      schema: schema,
      debounce: {
        in: 500,
        out: 0
      }
    },
  });

  const [createUser, { loading, reset: resetMutation }] = useMutation<CreateUserMutation, CreateUserMutationVariables>(CREATE_USER, {
    onCompleted: () => {
      reset();
    },
    onError: () => {
      resetMutation();
    },
    update: (cache, { data }) => {
      const newUser = data?.createUser;
      if (!newUser) return;

      const result = cache.readQuery<UsersQuery>({ query: USERS_QUERY });
      const users = result?.users ?? [];

      cache.writeQuery<UsersQuery>({
        query: USERS_QUERY,
        data: { users: [...users, newUser] }
      });
    },
  });

  const handleSubmit = async (formValues: FormValues) => {
    if (loading) return;
    await createUser({
      variables: { input: formValues }
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/example/public/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Add user
        </h1>
        <Link href="/">
          <a className={styles.cardLink}>
            Go Home
          </a>
        </Link>

        <div className={styles.grid}>
          <form className={styles.formGrid} onSubmit={onSubmit(handleSubmit)}>
            <div className={styles.formControl}>
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                value={values.firstName}
                onChange={onChange}
                type="text"
              />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                name="lastName"
                value={values.lastName}
                onChange={onChange}
                type="text"
              />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                value={values.username}
                onChange={onChange}
                type="text"
              />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                value={values.email}
                onChange={onChange}
                type="email"
              />
            </div>
            <div className={styles.formControl} style={{ gridColumn: 'span 2'}}>
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                value={values.phone}
                onChange={onChange}
                type="text"
              />
            </div>
            <button className={styles.formSubmit} type="submit">Submit</button>
          </form>
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

export default CreateUserPage
