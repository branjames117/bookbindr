import { gql } from '@apollo/client';

export const QUERY_BOOKS = gql`
  query getBooks($query: String) {
    books {
      id
      title
      authors {
        author
      }
      description
      image
    }
  }
`;
