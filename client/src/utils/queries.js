import { gql } from '@apollo/client';

export const QUERY_BOOKS = gql`
  query books($query: String) {
    books(query: $query) {
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

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
    }
  }
`;
