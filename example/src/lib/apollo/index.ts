import { ApolloClient, HttpLink, InMemoryCache, QueryOptions } from '@apollo/client';
import { generateHydrationMap, NextApolloClient } from 'nextjs-apollo';
import { USERS_QUERY, USER_QUERY } from '../../gql';
import { UserQuery, UserQueryVariables, UsersQuery, UsersQueryVariables } from '../../types/generated';

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

export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient<
  typeof hydrationMap
>({
  hydrationMap,
  apolloClient: (headers) => new ApolloClient({
    ssrMode: typeof window === 'undefined',
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'http://localhost:3000/api/graphql',
      headers,
    }),
  })
});
