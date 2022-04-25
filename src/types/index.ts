import { IncomingHttpHeaders } from 'http';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  ApolloClient,
  ApolloError,
  ApolloQueryResult,
  NormalizedCacheObject,
  PureQueryOptions,
  QueryOptions,
} from '@apollo/client';
import { APOLLO_STATE_PROP_NAME } from '../constants';

// initialize apollo types
type InitialState = NormalizedCacheObject | undefined;

export interface InitializeApolloArgs {
  headers?: IncomingHttpHeaders | null;
  initialState?: InitialState | null;
}

// getServerSideProps types
export type HydrationResults<TProps> = {
  errors?: ApolloError[];
  results?: ApolloQueryResult<TProps>[];
};

export type HydrateQueries<THydrationMap> =
  | THydrationMap
  | PureQueryOptions[]
  | ((ctx: GetServerSidePropsContext) => PureQueryOptions[]);

export type ServerSidePropsResult<TProps> =
  | Promise<GetServerSidePropsResult<TProps>>
  | GetServerSidePropsResult<TProps>;

export type ClientInitFn<TProps> = (
  ctx: GetServerSidePropsContext,
  apolloClient: ApolloClient<NormalizedCacheObject>
) => ServerSidePropsResult<TProps>;

export interface GetServerSideApolloPropsOptions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TProps = Record<string, any> & GetServerSideApolloProps,
  THydrationMap = never
> {
  hydrateQueries?: HydrateQueries<THydrationMap>;
  onClientInitialized?: ClientInitFn<TProps>;
  onHydrationResults?: (results: HydrationResults<TProps>) => void | ServerSidePropsResult<TProps>;
}

export interface GetServerSideApolloProps {
  [APOLLO_STATE_PROP_NAME]: NormalizedCacheObject;
}

// query hydration types
export type QueryHydrationMap = Record<string, (ctx: GetServerSidePropsContext) => QueryOptions>;
