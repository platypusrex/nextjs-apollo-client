import { IncomingHttpHeaders } from 'http';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';
import { AppProps } from 'next/app';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { APOLLO_STATE_PROP_NAME } from './constants';
import {
  GetServerSideApolloProps,
  GetServerSideApolloPropsOptions,
  HydrationResults,
  InitializeApolloArgs,
  QueryHydrationMap,
} from './types';

let client: ApolloClient<NormalizedCacheObject> | undefined;

export interface NextApolloClientOptions {
  apolloClient: (
    initialState: NormalizedCacheObject,
    headers?: IncomingHttpHeaders | null
  ) => ApolloClient<NormalizedCacheObject>;
  hydrationMap: QueryHydrationMap;
}

export class NextApolloClient<THydrationMap extends QueryHydrationMap> {
  private readonly _client!: NextApolloClientOptions['apolloClient'];
  private readonly _hydrationMap!: NextApolloClientOptions['hydrationMap'];

  constructor({ apolloClient, hydrationMap }: NextApolloClientOptions) {
    this._client = apolloClient;
    this._hydrationMap = hydrationMap;
  }

  private initializeApollo = (
    { headers, initialState }: InitializeApolloArgs = {
      headers: null,
      initialState: null,
    }
  ): ApolloClient<NormalizedCacheObject> => {
    const _apolloClient = client ?? this._client(initialState ?? {}, headers);

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
    if (!client) client = _apolloClient;

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
    TProps,
    (keyof THydrationMap)[]
  > = {}): GetServerSideProps => async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<GetServerSideApolloProps>> => {
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

    if (hydrateQueries) {
      const queries = Array.isArray(hydrateQueries) ? hydrateQueries : hydrateQueries(ctx);
      const queryResults = await Promise.allSettled(
        (queries as any[]).map(query => {
          const queryOptions = typeof query === 'string' ? this._hydrationMap[query](ctx) : query;
          return apolloClient.query(queryOptions);
        })
      );

      const hydrationResults = queryResults.reduce<HydrationResults>((acc, curr) => {
        if (curr.status === 'rejected') {
          acc['errors'] = [...(acc['errors'] ?? []), curr.reason];
        }
        if (curr.status === 'fulfilled') {
          acc['results'] = [...(acc['results'] ?? []), curr.value];
        }
        return acc;
      }, {});

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
