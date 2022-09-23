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

// type GetInsideQuery<X> = X extends QueryOptions<any, infer Q> ? Q : never;
//
// export type HydrationCompleteResults<T extends QueryHydrationMap> = [ApolloQueryResult<GetInsideQuery<ReturnType<T[keyof T]>>>];
// type MyType = HydrationCompleteResults<typeof hydrationMap>;
//
// // oh boy don't do this
// type UnionToIntersection<U> =
//   (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
// type LastOf<T> =
//   UnionToIntersection<T extends any ? () => T : never> extends () => (infer R) ? R : never
//
// // TS4.0+
// type Push<T extends any[], V> = [...T, V];
//
// // TS4.1+
// type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> =
//   true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>
//
// type abc = 'a' | 'b' | 'c';
// type t = TuplifyUnion<abc>; // ["a", "b", "c"]
//
// type ObjValueTuple<T, KS extends any[] = TuplifyUnion<keyof T>, R extends any[] = []> =
//   KS extends [infer K, ...infer KT]
//     ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
//     : R
//
// type Fucko = ObjValueTuple<ApolloQueryResult<GetInsideQuery<ReturnType<typeof hydrationMap['user']>>>>;


/**
 * To fully customize the client, the NextApolloClient accepts a function
 * that returns a new instance of ApolloClient. The other option is simple a partial
 * of the ApolloClient config with sensible defaults. This should be good enough for most
 * use cases.
 *
 * const client: NextApolloClientOptions['client'] = (headers) =>
 *   new ApolloClient({
*       uri: 'http://localhost:3000/api/graphql',
*       headers: {
 *        cookie: headers.cookie
 *      },
 *   });
 */


export const { getServerSideApolloProps, useApolloClient } = new NextApolloClient<
  typeof hydrationMap
>({
  hydrationMap,
  client: {
    uri: 'http://localhost:3002/api/graphql',
  }
});
