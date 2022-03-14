import { gql } from '@apollo/client';

export const QUERY_BOOKS = gql`
  query books($query: String) {
    books(query: $query) {
      bookId
      title
      authors
      description
      image
      link
    }
  }
`;

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;
