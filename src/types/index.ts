import { IncomingHttpHeaders } from 'http';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  ApolloClient,
  ApolloClientOptions,
  ApolloError,
  ApolloLink,
  ApolloQueryResult,
  InMemoryCacheConfig,
  NormalizedCacheObject,
  PureQueryOptions,
  QueryOptions,
} from '@apollo/client';
import { APOLLO_STATE_PROP_NAME } from '../constants';

// initialize apollo types
export type InitialState = NormalizedCacheObject | undefined;

export interface InitializeApolloArgs {
  headers?: IncomingHttpHeaders | null;
  initialState?: InitialState | null;
}

export type PartialApolloClientOptions = Omit<
  ApolloClientOptions<NormalizedCacheObject>,
  'link' | 'cache' | 'ssrMode'
> & {
  uri: string;
  cacheOptions?: InMemoryCacheConfig;
  links?: ApolloLink[];
};

type ApolloClientFn = (
  initialState: NormalizedCacheObject,
  headers?: IncomingHttpHeaders | null
) => ApolloClient<NormalizedCacheObject>;

export type ApolloClientConfig = PartialApolloClientOptions | ApolloClientFn;

// getServerSideProps types
export type HydrationResponse<THydrationMap extends QueryHydrationMap = any> = {
  errors?: ApolloError[];
  results?: THydrationMap extends any ? AnyHydrationResults : HydrationResults<THydrationMap>;
};

export type HydrateQueries<THydrationMap> =
  | THydrationMap
  | PureQueryOptions[]
  | ((ctx: GetServerSidePropsContext) => PureQueryOptions[]);

export type ServerSidePropsResult<TProps> =
  | void
  | Promise<void>
  | Promise<GetServerSidePropsResult<TProps>>
  | GetServerSidePropsResult<TProps>;

export interface GetServerSideApolloPropsOptions<
  TProps = Record<string, any> & GetServerSideApolloProps,
  THydrationMapKeys = any,
  THydrationMap extends QueryHydrationMap = any
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

export interface GetServerSideApolloProps {
  [APOLLO_STATE_PROP_NAME]: NormalizedCacheObject;
}

// query hydration types
export type QueryHydrationMap = Record<string, (ctx: GetServerSidePropsContext) => QueryOptions>;

export type HydrationResults<T extends QueryHydrationMap> = {
  [K in keyof T]?: ApolloQueryResult<HydrationQueryOptions<ReturnType<T[K]>>>;
};

export type AnyHydrationResults<T = { [key: string]: any }> = {
  [K in keyof T]?: ApolloQueryResult<T>;
};

export type HydrationQueryOptions<T> = T extends QueryOptions<any, infer Q> ? Q : never;
