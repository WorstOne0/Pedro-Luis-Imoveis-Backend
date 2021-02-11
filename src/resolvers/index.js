const userResolvers = require("./User");
const postResolvers = require("./Post");
//const custom = require("./Custom");

module.exports = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
  },

  User: {
    ...userResolvers.User,
  },

  Post: {
    //...postResolvers.Post,
  },
};
