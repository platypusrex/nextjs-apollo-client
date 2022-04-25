import { ApolloClient, HttpLink, InMemoryCache, QueryOptions } from '@apollo/client';
import { generateHydrationMap, NextApolloClient, NextApolloClientOptions } from 'nextjs-apollo-client';
import { UserQuery, UserQueryVariables, UsersQuery, UsersQueryVariables } from '../../types/generated';
import { USERS_QUERY, USER_QUERY } from '../../gql';

const hydrationMap = generateHydrationMap({
  users: (): QueryOptions<UsersQueryVariables, UsersQuery> => ({
    query: USERS_QUERY,
  }),
  user: ({ query }): QueryOptions<UserQueryVariables, UserQuery> => ({
    query: USER_QUERY,
    variables: {
      id: Number(query.userId as string)
    }
  })
});

const apolloClient: NextApolloClientOptions['apolloClient'] = (headers) =>
  new ApolloClient({
    ssrMode: typeof window === 'undefined',
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'http://localhost:3000/api/graphql',
      headers,
    }),
  })

export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient<
  typeof hydrationMap
>({
  hydrationMap,
  apolloClient
});
