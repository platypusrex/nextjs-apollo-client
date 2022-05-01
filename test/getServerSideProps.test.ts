import { GetServerSidePropsContext } from 'next';
import { ApolloError, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as nextApolloClient from '../src/NextApolloClient';
import { APOLLO_STATE_PROP_NAME } from '../src/constants';
import { NextApolloClient, GetServerSideApolloPropsOptions } from '../src';
// @ts-ignore
import { apolloClient, context, hydrationMap, NOT_FOUND_QUERY, USERS_QUERY } from './utils';

(window as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

describe('getServerSideApolloProps', () => {
  beforeEach(() => {
    (nextApolloClient as any).__APOLLO_CLIENT__ = undefined;
  });
  describe('basic usage', () => {
    it('should hydrate the provided query and return the cache state', async () => {
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });
      const spy = jest.spyOn(apolloClient, 'query');
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(result).toEqual({
        props: {
          [APOLLO_STATE_PROP_NAME]: {
            ROOT_QUERY: { __typename: 'Query', users: [] },
          },
        },
      });
    });

    it('should hydrate a query using the provided hydration map', async () => {
      const { getServerSideApolloProps } = new NextApolloClient<typeof hydrationMap>({
        hydrationMap,
        client: () => apolloClient,
      });
      const spy = jest.spyOn(apolloClient, 'query');
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(result).toEqual({
        props: {
          [APOLLO_STATE_PROP_NAME]: {
            ROOT_QUERY: { __typename: 'Query', users: [] },
          },
        },
      });
    });

    it('should concat any number of Apollo links using partial Apollo client config', async () => {
      const linkFn = jest.fn();
      const link = new ApolloLink((operation, forward) => {
        linkFn();
        return forward(operation);
      });

      const authFn = jest.fn();
      const auth = setContext((_, { headers }) => {
        authFn();
        return { headers };
      });
      const { getServerSideApolloProps } = new NextApolloClient<typeof hydrationMap>({
        hydrationMap,
        client: {
          uri: 'https://mygraphql.com/graphql',
          links: [link, auth],
        },
      });
      await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
      })(context as GetServerSidePropsContext);

      expect(linkFn).toHaveBeenCalled();
      expect(authFn).toHaveBeenCalled();
    });

    it('should allow for custom InMemoryCache configuration using partial Apollo client config', async () => {
      const typePolicies = {
        Users: { keyFields: ['firstName'] },
      };
      const { getServerSideApolloProps } = new NextApolloClient<typeof hydrationMap>({
        hydrationMap,
        client: {
          uri: 'https://mygraphql.com/graphql',
          cacheOptions: { typePolicies },
        },
      });

      await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
      })(context as GetServerSidePropsContext);

      expect(nextApolloClient.__APOLLO_CLIENT__).toBeDefined();
      expect(
        (nextApolloClient as any).__APOLLO_CLIENT__?.cache.policies.config.typePolicies
      ).toEqual(typePolicies);
    });
  });

  describe('onHydrationComplete', () => {
    it('should call hydrationComplete callback and merge additional props with apollo cache state', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      const onHydrationComplete: GetServerSideApolloPropsOptions<
        any
      >['onHydrationComplete'] = jest.fn(({ results }) => {
        const users = results?.find(result => result.data.users);
        return { props: { users } };
      });
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
        onHydrationComplete,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(onHydrationComplete).toHaveBeenCalledWith({
        results: [{ data: { users: [] }, loading: false, networkStatus: 7 }],
      });
      expect(result).toEqual({
        props: {
          [APOLLO_STATE_PROP_NAME]: {
            ROOT_QUERY: { __typename: 'Query', users: [] },
          },
          users: { data: { users: [] }, loading: false, networkStatus: 7 },
        },
      });
    });

    it('should call hydrationComplete callback and return redirect', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      const onHydrationComplete: GetServerSideApolloPropsOptions<
        any
      >['onHydrationComplete'] = jest.fn(({ results }) => {
        const users = results?.find(result => result.data.books);
        return !users ? { redirect: { destination: '/', permanent: false } } : { props: { users } };
      });
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
        onHydrationComplete,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(result).toEqual({
        redirect: {
          destination: '/',
          permanent: false,
        },
      });
    });

    it('should call hydrationComplete callback and return notFound', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      const onHydrationComplete: GetServerSideApolloPropsOptions<
        any
      >['onHydrationComplete'] = jest.fn(({ results }) => {
        const users = results?.find(result => result.data.books);
        return !users ? { notFound: true } : { props: { users } };
      });
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
        onHydrationComplete,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(result).toEqual({ notFound: true });
    });

    it('should call hydrationComplete callback with list of apollo errors', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      // @ts-ignore
      const onHydrationComplete: GetServerSideApolloPropsOptions<
        any
      >['onHydrationComplete'] = jest.fn(({ errors }) => {
        return errors?.length ? { redirect: { destination: '/404' } } : { props: {} };
      });
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: NOT_FOUND_QUERY }],
        onHydrationComplete,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: NOT_FOUND_QUERY });
      expect(onHydrationComplete).toHaveBeenCalledWith({
        errors: [
          new ApolloError({
            networkError: new Error(
              'No more mocked responses for the query: query Books {\n  books {\n    id\n  }\n}\nExpected variables: {}\n'
            ),
          }),
        ],
      });
      expect(result).toEqual({ redirect: { destination: '/404' } });
    });
  });

  describe('onClientInitialized', () => {
    it('should call onClientInitial callback and merge additional props with apollo cache state', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      const onClientInitialized: GetServerSideApolloPropsOptions<
        any
      >['onClientInitialized'] = jest.fn(async (_, apolloClient) => {
        const result = await apolloClient.query({ query: USERS_QUERY });
        return { props: { result } };
      });
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
        onClientInitialized,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(onClientInitialized).toHaveBeenCalledWith(context, apolloClient);
      expect(result).toEqual({
        props: {
          [APOLLO_STATE_PROP_NAME]: {
            ROOT_QUERY: { __typename: 'Query', users: [] },
          },
          result: { data: { users: [] }, loading: false, networkStatus: 7 },
        },
      });
    });

    it('should call onClientInitial callback and return redirect', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      const onClientInitialized: GetServerSideApolloPropsOptions<
        any
      >['onClientInitialized'] = jest.fn(() => {
        return { redirect: { destination: '/', permanent: false } };
      });

      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
        onClientInitialized,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(onClientInitialized).toHaveBeenCalledWith(context, apolloClient);
      expect(result).toEqual({ redirect: { destination: '/', permanent: false } });
    });

    it('should call onClientInitial callback and return notFound', async () => {
      const spy = jest.spyOn(apolloClient, 'query');
      const { getServerSideApolloProps } = new NextApolloClient({
        client: () => apolloClient,
      });

      const onClientInitialized: GetServerSideApolloPropsOptions<
        any
      >['onClientInitialized'] = jest.fn(() => {
        return { notFound: true };
      });
      const result = await getServerSideApolloProps({
        hydrateQueries: [{ query: USERS_QUERY }],
        onClientInitialized,
      })(context as GetServerSidePropsContext);

      expect(spy).toHaveBeenCalledWith({ query: USERS_QUERY });
      expect(onClientInitialized).toHaveBeenCalledWith(context, apolloClient);
      expect(result).toEqual({ notFound: true });
    });
  });
});
