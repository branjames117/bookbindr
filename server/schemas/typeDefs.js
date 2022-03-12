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
    image: String
  }

  type User {
    _id: ID
    username: String
    email: String
    savedBooks: [Book]
  }

  type Query {
    me: User
    books(query: String): [Book]
    myBooks(username: String!): [Book]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    createUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookId: ID!): Book
    deleteBook(bookId: ID!): Book
  }
`;

module.exports = typeDefs;
