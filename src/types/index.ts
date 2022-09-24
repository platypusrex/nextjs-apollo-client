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
export type HydrationResponse<THydrationMap extends QueryHydrationMap> = HydrationCompleteResults<
  THydrationMap
> & {
  errors?: ApolloError[];
};

export type HydrationCompleteResults<
  THydrationMap extends QueryHydrationMap
> = THydrationMap extends never ? AnyHydrationResults : HydrationResults<THydrationMap>;

export type HydrateQueries<THydrationMap> =
  | THydrationMap
  | PureQueryOptions[]
  | ((ctx: GetServerSidePropsContext) => PureQueryOptions[]);

export type ServerSidePropsResult<TProps = Record<string, any>> =
  | void
  | Promise<void>
  | Promise<GetServerSidePropsResult<TProps>>
  | GetServerSidePropsResult<TProps>;

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

export interface GetServerSideApolloProps {
  [APOLLO_STATE_PROP_NAME]: NormalizedCacheObject;
}

// query hydration types
export type QueryHydrationMap = Record<string, (ctx: GetServerSidePropsContext) => QueryOptions>;

export type HydrationResults<T extends QueryHydrationMap> = {
  [K in keyof T]?: ApolloQueryResult<
    ReturnType<T[K]> extends QueryOptions ? HydrationQueryOptions<ReturnType<T[K]>> : any
  >;
};

export type AnyHydrationResults<T = { [key: string]: any }> = {
  [K in keyof T]?: ApolloQueryResult<T>;
};

export type HydrationQueryOptions<T> = T extends QueryOptions<any, infer Q>
  ? StrictlyUnknown<Q> extends true
    ? any
    : Q
  : never;

type StrictlyUnknown<T> = unknown extends T ? true : false;
