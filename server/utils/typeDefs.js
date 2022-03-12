const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Author {
    author: String
  }

  type Book {
    id: ID
    title: String
    authors: [Author]
    description: String
  }

  type Query {
    books(query: String!): [Book]
  }

  type Query {
    myBooks(username: String!): [Book]
  }
`;

module.exports = typeDefs;
