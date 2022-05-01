import { gql } from '@apollo/client';
import { createMockClient } from '@apollo/client/testing';
import { generateHydrationMap } from '../../src';

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      firstName
      lastName
    }
  }
`;

export const NOT_FOUND_QUERY = gql`
  query Books {
    books {
      id
    }
  }
`;

export const apolloClient = createMockClient(
  { users: [] },
  USERS_QUERY
)

export const context = {
  req: { headers: {} }
};

export const hydrationMap = generateHydrationMap({ users: () => ({ query: USERS_QUERY }) })
