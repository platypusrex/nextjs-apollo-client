import { QueryOptions } from '@apollo/client';
import { generateHydrationMap, NextApolloClient } from 'nextjs-apollo-client';
import {
  BooksQuery,
  BooksQueryVariables,
  UserQuery,
  UserQueryVariables,
  UsersQuery,
  UsersQueryVariables
} from '../../types/generated';
import { USERS_QUERY, USER_QUERY, BOOKS_QUERY } from '../../gql';

const hydrationMap = generateHydrationMap({
  user: ({ query }): QueryOptions<UserQueryVariables, UserQuery> => ({
    query: USER_QUERY,
    variables: { id: query.userId as string }
  }),
  users: (): QueryOptions<UsersQueryVariables, UsersQuery> => ({ query: USERS_QUERY }),
  books: (): QueryOptions<BooksQueryVariables, BooksQuery> => ({ query: BOOKS_QUERY }),
});

/**
 * To fully customize the client, the NextApolloClient accepts a function
 * that returns a new instance of ApolloClient. The other option is simple a partial
 * of the ApolloClient config with sensible defaults. This should be good enough for most
 * use cases.
 *
 * const client: NextApolloClientOptions['client'] = (initialState, headers) =>
 *   new ApolloClient({
 *     ssrMode: typeof window === 'undefined',
 *     cache: new InMemoryCache().restore(initialState),
 *     link: new HttpLink({
 *       uri: 'http://localhost:3000/api/graphql',
 *       headers,
 *     }),
 *   });
 */

export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient<
  typeof hydrationMap
>({
  hydrationMap,
  client: {
    uri: 'http://localhost:3000/api/graphql',
  }
});
