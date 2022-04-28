import { gql } from '@apollo/client';

export const BOOK_FRAGMENT = gql`
  fragment Book on Book {
    id
    title
    author
  }
`;
