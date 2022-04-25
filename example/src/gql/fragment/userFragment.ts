import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment User on User {
    id
    name
    email
    phoneNumber
    age
    favoriteColor
    favoriteMovie
  }
`;
