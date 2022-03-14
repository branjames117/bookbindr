const { AuthenticationError } = require('apollo-server-express');
const fetch = require('node-fetch');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          '-__v -password'
        );

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },

    books: async (parent, { query }) => {
      console.log('Books query called with query: ', query);
      const params = query ? query : {};
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${params}`
      );
      const { items } = await response.json();
      const books = items.map((book) => {
        return {
          bookId: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors
            ? book.volumeInfo.authors
            : ['No authors to display'],
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
          link: book.volumeInfo.infoLink,
        };
      });

      return books;
    },
  },

  Mutation: {
    createUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      console.log(email);
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { bookInput }, context) => {
      console.log('Attempting book save');
      console.log(bookInput);
      try {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        );

        return user;
      } catch (err) {
        console.log(err);
        throw new Error('User not updated');
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      console.log('attempting to remove book with ID: ', bookId);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('User not updated');
        }

        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error('User not updated');
      }
    },
  },
};

module.exports = resolvers;
