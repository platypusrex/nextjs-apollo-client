import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment User on User {
    id
    firstName
    lastName
    username
    email
    phone
    img
  }
`;
