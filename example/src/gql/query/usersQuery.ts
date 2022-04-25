import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragment';

export const USERS_QUERY = gql`
  query Users {
    users {
      ...User
    }
  }
  ${USER_FRAGMENT}
`;
