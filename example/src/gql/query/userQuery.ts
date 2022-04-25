import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragment';

export const USER_QUERY = gql`
  query User ($id: Int!) {
    user (id: $id) {
      ...User
    }
  }
  ${USER_FRAGMENT}
`;
