import { gql, OperationVariables, QueryOptions } from '@apollo/client';
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

export const apolloClient = createMockClient({ users: [] }, USERS_QUERY);

export const context = {
  req: { headers: {} },
};

export type UsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string | null;
    img: string;
  }>;
};

export const hydrationMap = generateHydrationMap({
  users: (): QueryOptions<OperationVariables, UsersQuery> => ({ query: USERS_QUERY }),
});
