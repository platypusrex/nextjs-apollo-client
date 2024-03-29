import merge from 'deepmerge';
import isEqual from 'lodash.isequal';
import { useMemo } from 'react';
import { AppProps } from 'next/app';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { APOLLO_STATE_PROP_NAME } from './constants';
import {
  ApolloClientConfig,
  GetServerSideApolloProps,
  GetServerSideApolloPropsOptions,
  HydrationCompleteResults,
  HydrationResponse,
  InitializeApolloArgs,
  PartialApolloClientOptions,
  QueryHydrationMap,
} from './types';

export let __APOLLO_CLIENT__: ApolloClient<NormalizedCacheObject> | undefined;

export interface NextApolloClientOptions {
  client: ApolloClientConfig;
  hydrationMap?: QueryHydrationMap;
}

export class NextApolloClient<THydrationMap extends QueryHydrationMap> {
  private readonly _client!: NextApolloClientOptions['client'];
  private readonly _hydrationMap?: NextApolloClientOptions['hydrationMap'];

  constructor({ client, hydrationMap }: NextApolloClientOptions) {
    this._client = client;
    this._hydrationMap = hydrationMap;
  }

  private createApolloClient = (
    apolloClient: NextApolloClientOptions['client'],
    initialState: InitializeApolloArgs['initialState'],
    headers: InitializeApolloArgs['headers']
  ) => {
    if (typeof apolloClient === 'function') {
      return apolloClient(initialState ?? {}, headers);
    } else {
      const {
        uri,
        links,
        cacheOptions,
        credentials,
        headers: configHeaders,
        ...rest
      } = apolloClient as PartialApolloClientOptions;
      const httpLink = new HttpLink({
        uri,
        credentials,
        headers: {
          ...headers,
          ...configHeaders,
        },
      });
      return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        connectToDevTools: typeof window !== 'undefined',
        link: ApolloLink.from([...(links ?? []), httpLink]),
        cache: new InMemoryCache(cacheOptions).restore(initialState ?? {}),
        ...rest,
      });
    }
  };

  public initializeApollo = (
    { headers, initialState }: InitializeApolloArgs = {
      headers: null,
      initialState: null,
    }
  ): ApolloClient<NormalizedCacheObject> => {
    const _apolloClient =
      __APOLLO_CLIENT__ ?? this.createApolloClient(this._client, initialState ?? {}, headers);

    if (initialState) {
      const existingCache = _apolloClient.extract();

      const data = merge(existingCache, initialState, {
        arrayMerge: (destinationArray, sourceArray) => [
          ...sourceArray,
          ...destinationArray.filter(d => sourceArray.every(s => !isEqual(d, s))),
        ],
      });

      _apolloClient.cache.restore(data);
    }
    if (typeof window === 'undefined') return _apolloClient;
    if (!__APOLLO_CLIENT__) __APOLLO_CLIENT__ = _apolloClient;

    return _apolloClient;
  };

  private addApolloState = (
    client: ApolloClient<NormalizedCacheObject>,
    pageProps: AppProps['pageProps']
  ): AppProps['pageProps'] => {
    if (pageProps?.props) {
      pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
    }

    return pageProps;
  };

  public useApolloClient = (
    pageProps: AppProps['pageProps']
  ): ApolloClient<NormalizedCacheObject> => {
    const state = pageProps[APOLLO_STATE_PROP_NAME];
    return useMemo(() => this.initializeApollo({ initialState: state }), [state]);
  };

  public getServerSideApolloProps = <TProps = Record<string, any>>({
    hydrateQueries,
    onClientInitialized,
    onHydrationComplete,
  }: GetServerSideApolloPropsOptions<
    THydrationMap,
    (keyof THydrationMap)[],
    TProps
  > = {}): GetServerSideProps<GetServerSideApolloProps & TProps> => async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<GetServerSideApolloProps & TProps>> => {
    const apolloClient = this.initializeApollo({ headers: ctx.req.headers });
    let baseProps = {};

    if (onClientInitialized) {
      // @ts-ignore
      const { props, notFound, redirect } = (await onClientInitialized(ctx, apolloClient)) ?? {};
      if (props) {
        baseProps = { ...props };
      }
      if (notFound) return { notFound };
      if (redirect) return { redirect };
    }

    if (hydrateQueries?.length) {
      const queries = Array.isArray(hydrateQueries) ? hydrateQueries : hydrateQueries(ctx);
      const queryResults = await Promise.allSettled(
        (queries as any[]).map(query => {
          const queryOptions =
            !!this._hydrationMap && typeof query === 'string'
              ? this._hydrationMap[query](ctx)
              : query;
          return apolloClient.query(queryOptions);
        })
      );

      const hydrationResults = queryResults.reduce<HydrationResponse<THydrationMap>>(
        (acc, curr) => {
          if (curr.status === 'rejected') {
            acc['errors'] = [...(acc['errors'] ?? []), curr.reason];
          }
          if (curr.status === 'fulfilled') {
            const currentKey = Object.keys(curr.value.data)[0];
            acc = { ...acc, [currentKey]: curr.value };
          }
          return acc;
        },
        {} as HydrationCompleteResults<THydrationMap>
      );

      if (onHydrationComplete) {
        // @ts-ignore
        const { props, notFound, redirect } = onHydrationComplete(hydrationResults) ?? {};
        if (props) {
          baseProps = {
            ...baseProps,
            ...props,
          };
        }
        if (notFound) return { notFound };
        if (redirect) return { redirect };
      }
    }

    return this.addApolloState(apolloClient, {
      props: baseProps,
    });
  };
}
