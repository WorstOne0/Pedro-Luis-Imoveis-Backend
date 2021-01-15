const { ApolloError, ValidationError } = require("apollo-server-express");
const AWS = require("aws-sdk");
const fs = require("fs");

require("dotenv").config();

const User = require("../models/User");
const Post = require("../models/Post");

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  },
  region: process.env.AWS_S3_REGION,
});

module.exports = {
  Query: {
    posts: () => Post.find(),
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
