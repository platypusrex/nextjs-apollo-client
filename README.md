<p align="left">
  <img src="https://user-images.githubusercontent.com/7143612/166865041-706b38dd-6cfb-465f-8dbe-61000481025a.png" width="100" height="100" style="display: inline" />
  <img src="https://user-images.githubusercontent.com/7143612/166865059-5a2d8f22-e20b-48a8-9d37-9b7474cd853f.png" width="auto" height="100" style="display: inline" />
</p>


# nextjs-apollo-client
[![npm Package](https://img.shields.io/npm/v/nextjs-apollo-client.svg)](https://www.npmjs.org/package/nextjs-apollo-client)
[![License](https://img.shields.io/npm/l/nextjs-apollo-client.svg)](https://github.com/platypusrex/nextjs-apollo-client/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/platypusrex/nextjs-apollo-client/badge.svg?branch=master)](https://coveralls.io/github/platypusrex/nextjs-apollo-client?branch=master)
![CI](https://github.com/platypusrex/nextjs-apollo-client/workflows/CI/badge.svg)

Simple integration of Apollo client in a Next.js application. Easy setup with a simple
but powerful API that can adapt to any use case.

### Installation
npm
```shell
npm i nextjs-apollo-client @apollo/client graphql
```
or yarn
```shell
yarn add nextjs-apollo-client @apollo/client graphql
```

### Setup
The example below is the bare minimum requirements to get started. For more info about the API and usage continue
reading. For more advanced usage check out the [example](https://github.com/platypusrex/nextjs-apollo-client/tree/master/example).

1. **Create a new instance of `NextApolloClient`**
```ts
// lib/apollo/index.ts
export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient({
  client: { uri: 'http://mygraph.com/graphql' }
});
```

2. **Add the Apollo provider to `_app.tsx` passing in the client**
```tsx
// _app.tsx
import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client';
import { useApolloClient } from '../lib/apollo';

const App = ({ Component, pageProps }: AppProps) => {
  const client = useApolloClient(pageProps);
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default App
```

3. **Utilize the generated `getServerSideApolloProps` to start hydrating data for your pages**
```tsx
import type { NextPage } from 'next'
import { useQuery } from '@apollo/client';
import { getServerSideApolloProps } from '../lib/apollo';
import { USERS_QUERY } from '../gql';

const Home: NextPage = () => {
  const { data } = useQuery(USERS_QUERY);

  return (
    <div>
      ...rest
    </div>
  )
}

export const getServerSideProps = getServerSideApolloProps({
  hydrateQueries: (ctx) => [
    { query: USER_QUERY, variables: { id: ctx.query.id } }
  ],
});

export default Home;
```

**Note:**
The `nextjs-apollo-client` package works really well with [next-merge-props](https://github.com/platypusrex/next-merge-props).
Especially if you have multiple abstractions for Next.js server side data fetching functions.

```tsx
import type { NextPage } from 'next'
import { useQuery } from '@apollo/client';
import { mergeProps } from 'next-merge-props';
import { getServerSideAuthProps } from '../lib/auth';
import { getServerSideApolloProps } from '../lib/apollo';
import { USERS_QUERY } from '../gql';

const Home: NextPage = () => {
  const { data } = useQuery(USERS_QUERY);

  return (
    <div>
      ...rest
    </div>
  )
}

export const getServerSideProps = mergeProps(
  getServerSideAuthProps,
  getServerSideApolloProps({
    hydrateQueries: (ctx) => [
      { query: USER_QUERY, variables: { id: ctx.query.id } }
    ],
  })
);

export default Home;
```

### NextApolloClient

#### Options
Below is a table that represents the structure of that `NextApolloClient` options object.

| **Property** | **Type**                                                                                                                                       | **Required** |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------| --- |
| client       | [ApolloClientConfig](https://github.com/platypusrex/nextjs-apollo-client/blob/e7bff6af8b0c90aea015db3ef3ebd99c6379493d/src/types/index.ts#L40) | yes |
| hydrationMap | [QueryHydrationMap](https://github.com/platypusrex/nextjs-apollo-client/blob/e7bff6af8b0c90aea015db3ef3ebd99c6379493d/src/types/index.ts#L83)  | no (recommended) |

```ts
export interface NextApolloClientOptions {
  client: ApolloClientConfig;
  hydrationMap?: QueryHydrationMap;
}
```

`client`

The only required option when creating an instance of `NextApolloClient`. Accepts a partial Apollo client config. For a complete list of available via partial config visit
the link to the types above.

**Partial Config:**
```ts
export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient({
  client: { uri: 'http://mygraph.com/graphql' },
});
```

You can also pass in a function that returns an instance of `ApolloClient` which allows complete control of the Apollo
client setup. The function also gives you access to the current client cache state and [Context](https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#context-parameter)
object from Next.js.

**Apollo client:**
```ts
export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient({
  client: (initialState, headers) =>
    new ApolloClient({
      ssrMode: typeof window === 'undefined',
      cache: new InMemoryCache().restore(initialState),
      link: new HttpLink({
        uri: 'http://mygraph.com/graphql',
        headers,
      }),
    }),
});
```

`hydrationMap`

You can optionally pass in a hydration map. Once you have generated a hydration you can simply reference any key from
your map in the `getServerSideApolloProps` function to hydrate that page with any query in the hydration map.

The `nextjs-apollo-client` package includes a util to that you will need to use to generate the map: `generateHydrationMap`.
To get autocompletion for your hydration map, you can provide the instance of `NextApolloClient` with the hydration map
generic.

1. **Generate the hydration map**

The `generateHydrationMap` function accepts a key/value pair. The key you use will also be the string you reference to
hydrate queries. The value is a function that provides access to the Next.js [Context](https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#context-parameter)
object and must return a [QueryOptions](https://github.com/apollographql/apollo-client/blob/c7f268d1c36cfebdb64abdb0640a546f146e4e26/src/core/watchQueryOptions.ts#L53) object. 
```ts
// hydration map
const hydrationMap = generateHydrationMap({
  user: (ctx): QueryOptions<UserQueryVariables, UserQuery> => ({
    query: USER_QUERY,
    variables: { id: ctx.query.userId as string }
  }),
  users: (): QueryOptions<UsersQueryVariables, UsersQuery> => ({ query: USERS_QUERY }),
});
```
2. **Pass the hydration map to the `NextApolloClient`**

Now that you've generated the map, pass it into your `NextApolloClient` instance and provide the hydration map
generic for autocompletion.

```ts
export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient<
  typeof hydrationMap
>({
  hydrationMap,
  client: { uri: 'http://mygraph.com/graphql' },
});
```

3. **Utilize your hydration map from `getServerSideApolloProps`**

Now you're ready to go! Now you can reference any query in your map via a string via autocompletion. 

```ts
export const getServerSideProps = getServerSideApolloProps({
  hydrateQueries: ['users'],
});
```

### getServerSideApolloProps

The `NextApolloClient` instance exposes a public method called `getServerSideApolloProps`. This is the function 
that should be used to hydrate any Next.js page component with data.

#### Args
Below is a table that describes the accepted arguments.

| **Property**        | **Type**                                                                                                                                                                                                 | **Required**                                                |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| hydrateQueries      | [HydrateQueries<THydrationMap>](https://github.com/platypusrex/nextjs-apollo-client/blob/e7bff6af8b0c90aea015db3ef3ebd99c6379493d/src/types/index.ts#L73)                                                | no (if not provided all queries will be made on the client) |
| onClientInitialized | [ClientInitFn<TProps>](https://github.com/platypusrex/nextjs-apollo-client/blob/e7bff6af8b0c90aea015db3ef3ebd99c6379493d/src/types/index.ts#L74)                                                         | no                                                          |
| onHydrationComplete | [(results: HydrationResponse<THydrationMap>) => ServerSidePropsResult<TProps>](https://github.com/platypusrex/nextjs-apollo-client/blob/ad5af151c15f32205c5cb71e3d2cbcbfa6c6361c/src/types/index.ts#L72) | no                                                          |

```ts
export interface GetServerSideApolloPropsOptions<
  THydrationMap extends QueryHydrationMap,
  THydrationMapKeys = any,
  TProps = Record<string, any>
> {
  hydrateQueries?: HydrateQueries<THydrationMapKeys>;
  onClientInitialized?: (
    ctx: GetServerSidePropsContext,
    apolloClient: ApolloClient<NormalizedCacheObject>
  ) => ServerSidePropsResult<TProps>;
  onHydrationComplete?: (
    results: HydrationResponse<THydrationMap>
  ) => ServerSidePropsResult<TProps>;
}
```

`hydrateQueries`

This argument is not required, but it is required if you want to actually hydrate data on the server. There are a couple 
of different ways `hydrateQueries` can be used.

1. **Use with a hydration map**

If you have generated and provided `NextApolloClient` with a hydration map, you can simply reference your queries via map keys.

```ts
export const getServerSideProps = getServerSideApolloProps({
  hydrateQueries: ['users'],
});
```

2. **Use with `QueryOptions` array**

If your already familiar with Apollo client and have ever used `refetchQueries` as a side effect of mutation, this should
feel familiar. Accepts a function that provides the Next.js [Context](https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#context-parameter)
object and must return an array of [QueryOptions](https://github.com/apollographql/apollo-client/blob/c7f268d1c36cfebdb64abdb0640a546f146e4e26/src/core/watchQueryOptions.ts#L53)
objects.

```ts
export const getServerSideProps = getServerSideApolloProps({
  hydrateQueries: [
    { query: USERS_QUERY }
  ],
});

// or as a function

export const getServerSideProps = getServerSideApolloProps({
  hydrateQueries: (ctx) => [
    { query: USER_QUERY, variables: { id: ctx.query.id } }
  ],
});
```

`onClientInitialized`

The `getServerSideApolloProps` function also exposes a couple of callbacks that allow you to hook into different lifecycles 
of the function. The `onClientInitialized` callback does not assist with hydration but can still hydrate data. In fact,
it's basically an escape hatch that supports a wide variety of use cases.

* **Mutation operation run on the server**

Not a common use case, but if you need to do it you should do it here. A return is not required, but you can provide the 
same [return value](https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#getserversideprops-return-values)
expected in any Next.js `getServerSideProps` function.

```ts
export const getServerSideProps = getServerSideApolloProps<PageProps>({
  hydrateQueries: ['users'],
  onClientInitialized: async (ctx, apolloClient) => {
    const result = await apolloClient.mutate({
      mutation: MY_MUTATION,
      variables: {
        id: ctx.query.id
      }
    });

    return { props: { result } }
  },
})
```

`onHydrationComplete`

The second and last callback option is `onHydrationComplete`. This is used in conjunction with `hydrateQueries` and should
be more commonly used than `onClientInitialized`. The callback is run after any queries from `hydrateQueries` are run and
returns either the result of any hydration operation or errors from each query. Results for hydrated operations are mapped
to there operation name. If you have provided the hydration map generic to your instance of `NextApolloClient`, you
will get proper auto-completion for any of your hydrated operations.

A return is again not required, but you can provide the
same [return value](https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#getserversideprops-return-values)
expected in any Next.js `getServerSideProps` function.

```ts
interface PageProps {
  userId?: string; 
}

export const getServerSideProps = getServerSideApolloProps<PageProps>({
  hydrateQueries: ['user'],
  onHydrationComplete: ({ user, errors }) => {
    const currentUser = user?.data.user;
    
    if (errors.length) {
      return { notFound: true };
    }

    if (!currentUser) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    return {
      props: { userId: currentUser.id },
    };
  }
});
```

### useApolloClient

The only other public method returned from a `NextApolloClient` instance is `useApolloClient`. This react hook has only
one use case and that's to provide the client to Apollo client's context provider. The only argument passed to the hook 
are the `pageProps` associated with the Next.js [_app](https://nextjs.org/docs/advanced-features/custom-app) component.

```tsx
import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client';
import { useApolloClient } from '../lib/apollo';

const App = ({ Component, pageProps }: AppProps) => {
  const client = useApolloClient(pageProps);
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default App
```

### Contributors
This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## LICENSE
MIT
