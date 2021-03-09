const { ApolloError, ValidationError } = require("apollo-server-express");
require("dotenv").config();

const aws = require("aws-sdk");

const User = require("../models/User");
const Post = require("../models/Post");

const s3 = new aws.S3();

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
    updatePost: async (
      _,
      {
        postId,
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

      try {
        const post = await Post.findByIdAndUpdate(
          postId,
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
          {
            new: true,
          }
        );

        return post;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deletePost: async (_, { postId }, { req }) => {
      if (!req.userId) return null;

      try {
        const post = await Post.findById(postId);

        s3.deleteObject(
          {
            Bucket: "pedroluis",
            Key: post.thumbnail.key,
          },
          (error, data) => {
            if (error) throw new ApolloError(error);
          }
        );

        post.imagens.map((img) => {
          s3.deleteObject(
            {
              Bucket: "pedroluis",
              Key: img.key,
            },
            (error, data) => {
              if (error) throw new ApolloError(error);
            }
          );
        });

        post.remove();
      } catch (error) {
        throw new ApolloError(error);
      }

      return true;
    },

    deleteImg: async (_, { postId, key }, { req }) => {
      if (!req.userId) return null;

      try {
        const post = await Post.findById(postId);

        post.imagens.map((img) => {
          if (img.key !== key) return img;

          s3.deleteObject(
            {
              Bucket: "pedroluis",
              Key: img.key,
            },
            (error, data) => {
              if (error) throw new ApolloError(error);
            }
          );
        });

        post.imagens = post.imagens.filter((img) => img.key !== key);

        post.save();

        return true;
      } catch (error) {
        throw new ApolloError(error);
      }
    },

    deleteThumb: async (_, { postId, key }, { req }) => {
      if (!req.userId) return null;

      try {
        const post = await Post.findById(postId);

        s3.deleteObject(
          {
            Bucket: "pedroluis",
            Key: post.thumbnail.key,
          },
          (error, data) => {
            if (error) throw new ApolloError(error);
          }
        );

        post.thumbnail = {};

        post.save();

        return true;
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
