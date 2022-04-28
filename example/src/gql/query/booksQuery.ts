import { gql } from '@apollo/client';
import { BOOK_FRAGMENT } from '../fragment';

export const BOOKS_QUERY = gql`
  query Books {
    books {
      ...Book
    }
  }
  ${BOOK_FRAGMENT}
`;
