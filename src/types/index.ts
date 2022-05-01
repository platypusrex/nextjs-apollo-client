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

export type PartialApolloClientOptions = Pick<
  ApolloClientOptions<NormalizedCacheObject>,
  | 'assumeImmutableResults'
  | 'credentials'
  | 'connectToDevTools'
  | 'defaultOptions'
  | 'fragmentMatcher'
  | 'headers'
  | 'name'
  | 'version'
> & {
  uri: string;
  cacheOptions?: InMemoryCacheConfig;
  links?: ApolloLink[];
};

export type ApolloClientConfig =
  | PartialApolloClientOptions
  | ((
      initialState: NormalizedCacheObject,
      headers?: IncomingHttpHeaders | null
    ) => ApolloClient<NormalizedCacheObject>);

// getServerSideProps types
export type HydrationResults = {
  errors?: ApolloError[];
  results?: ApolloQueryResult<any>[];
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

export type ClientInitFn<TProps> = (
  ctx: GetServerSidePropsContext,
  apolloClient: ApolloClient<NormalizedCacheObject>
) => ServerSidePropsResult<TProps>;

export interface GetServerSideApolloPropsOptions<
  TProps = Record<string, any> & GetServerSideApolloProps,
  THydrationMap = never
> {
  hydrateQueries?: HydrateQueries<THydrationMap>;
  onClientInitialized?: ClientInitFn<TProps>;
  onHydrationComplete?: (results: HydrationResults) => ServerSidePropsResult<TProps>;
}

export interface GetServerSideApolloProps {
  [APOLLO_STATE_PROP_NAME]: NormalizedCacheObject;
}

// query hydration types
export type QueryHydrationMap = Record<string, (ctx: GetServerSidePropsContext) => QueryOptions>;
