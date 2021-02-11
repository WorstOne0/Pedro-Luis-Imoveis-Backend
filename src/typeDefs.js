const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Date
  scalar Anything

  type User {
    id: ID!
    email: String!
    password: String
    userName: String!
    profilePicture: String
    role: String!
    posts: [Post!]!
    thirdParty: String!
    createdAt: Date!
  }

  type Post {
    id: ID!
    postedBy: ID!
    name: String!
    type: String!
    description: String
    price: Int!
    info: Info!
    infoAdd: [String!]
    address: Address!
    imagens: [Image!]
    thumbnail: Image!
    createdAt: Date!
  }

  type Info {
    area: Int!
    sale: String!
    room: String!
    suite: String!
    garage: String!
    spotlight: Boolean!
  }

  input InfoInput {
    area: Int!
    sale: String!
    room: Int!
    suite: Int!
    garage: Int!
    spotlight: Boolean!
  }

  type Address {
    street: String!
    district: String!
    city: String!
    state: String!
    latitude: Float!
    longitude: Float!
  }

  input AddressInput {
    street: String!
    district: String!
    city: String!
    state: String!
    latitude: Float!
    longitude: Float!
  }

  type Image {
    name: String!
    key: String!
    url: String!
    size: String!
  }

  input ImageInput {
    name: String!
    key: String!
    url: String!
    size: String!
  }

  type Query {
    users: [User!]
    getUser(userId: ID!): User
    getLoggedUser: User

    posts: [Post!]!
    getPost(postId: ID!): Post
  }

  type Mutation {
    createUser(
      email: String!
      password: String
      userName: String!
      thirdParty: String!
      reCaptchaToken: String!
    ): User
    emailExists(email: String!): Boolean
    userNameExists(userName: String!): Boolean
    updateUser: User!
    login(
      email: String!
      password: String!
      thirdParty: String!
      thirdPartyPayloadJSON: String
      reCaptchaToken: String!
    ): User
    logout: Boolean!

    addPost(
      name: String!
      type: String!
      description: String
      price: Int!
      info: InfoInput!
      infoAdd: [String!]
      address: AddressInput!
      imagens: [ImageInput!]
      thumbnail: ImageInput!
    ): Post

    testUpload(file: Upload!): Boolean!
  }
`;
