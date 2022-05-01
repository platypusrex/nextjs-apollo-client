import { ApolloClient } from '@apollo/client';
import { renderHook } from '@testing-library/react-hooks';
import { NextApolloClient } from '../src';
import { APOLLO_STATE_PROP_NAME } from '../src/constants';
// @ts-ignore
import { apolloClient, hydrationMap } from './utils';

describe('useApolloState', () => {
  it('should', () => {
    const { useApolloClient } = new NextApolloClient<typeof hydrationMap>({
      hydrationMap,
      client: () => apolloClient,
    });

    const { result } = renderHook(() => useApolloClient({}));
    expect(result.current).toBeInstanceOf(ApolloClient);
  });

  it('should do it', () => {
    const { useApolloClient } = new NextApolloClient<typeof hydrationMap>({
      hydrationMap,
      client: () => apolloClient,
    });

    const { result } = renderHook(() =>
      useApolloClient({
        [APOLLO_STATE_PROP_NAME]: {
          ROOT_QUERY: { __typename: 'Query', users: [] },
        },
      })
    );
    expect(result.current).toBeInstanceOf(ApolloClient);
    expect(result.current.cache.extract()).toEqual({
      ROOT_QUERY: { __typename: 'Query', users: [] },
    });
  });
});
