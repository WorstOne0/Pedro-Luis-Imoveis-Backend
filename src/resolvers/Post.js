const { ApolloError, ValidationError } = require("apollo-server-express");

require("dotenv").config();

const User = require("../models/User");
const Post = require("../models/Post");

module.exports = {
  Query: {
    posts: () => Post.find(),
    searchPost: async (_, { query, page }, { req }) => {
      if (query.districtSelected === null) query.districtSelected = [];

      if (query.price.max >= 1000000) query.price.max = Infinity;
      if (query.area.max >= 2500) query.area.max = Infinity;

      try {
        const post = await Post.paginate(
          {
            type:
              query.realStateSelected == null
                ? { $exists: true }
                : query.realStateSelected,
            "info.sale":
              query.typeSelected == null
                ? { $exists: true }
                : query.typeSelected,
            "address.city":
              query.citySelected == null
                ? { $exists: true }
                : query.citySelected,
            "address.district":
              query.districtSelected.length === 0
                ? { $exists: true }
                : { $in: query.districtSelected },
            price: { $gte: query.price.min, $lte: query.price.max },
            "info.area": { $gte: query.area.min, $lte: query.area.max },
            "info.spotlight": query.spotlight
              ? query.spotlight
              : { $exists: true },
          },
          { page, limit: 12, sort: query.sort }
        );

        return post;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    getPost: (_, { postId }) => {
      return Post.findOne({ _id: postId });
    },
  },

  Mutation: {
    addPost: async (
      _,
      {
        name,
        type,
        description,
        price,
        info,
        infoAdd,
        address,
        imagens,
        thumbnail,
      },
      { req }
    ) => {
      if (!req.userId) return null;

      console.log("Post Recebido e Valido");

      try {
        const post = new Post({
          postedBy: req.userId,
          name,
          type,
          description,
          price,
          info,
          infoAdd,
          address,
          imagens,
          thumbnail,
        });

        return await post.save();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
  },

  Post: {
    async user(post) {
      try {
        return await User.findOne({ _id: post.postedBy });
      } catch (error) {
        throw new ValidationError("Post ID not found");
      }
    },
  },
};
