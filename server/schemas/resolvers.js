const { AuthenticationError } = require('apollo-server-express');
const fetch = require('node-fetch');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log(context.user);
      if (context.user) {
        console.log(context.user);
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

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
          id: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors
            ? book.volumeInfo.authors.map((author) => {
                return { author };
              })
            : ['No authors to display'],
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
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

    saveBook: async (parent, args, context) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error('User not updated');
      }
    },

    deleteBook: async (parent, args, context) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
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
