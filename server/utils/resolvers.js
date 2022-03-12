const fetch = require('node-fetch');

const resolvers = {
  Query: {
    books: async (parent, { query }) => {
      const params = query ? query : {};
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${params}`
      );
      const { items } = await response.json();
      const books = items.map((book) => {
        return {
          id: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors.map((author) => {
            return { author };
          }),
          description: book.volumeInfo.description,
        };
      });

      return books;
    },
  },
};

module.exports = resolvers;
