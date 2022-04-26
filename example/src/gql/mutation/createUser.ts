import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragment';

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...User
    }
  }
  ${USER_FRAGMENT}
`;
