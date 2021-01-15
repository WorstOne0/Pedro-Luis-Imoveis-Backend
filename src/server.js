const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const { setRefreshToken } = require("./jwt");

require("dotenv").config();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
  });

  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const app = express();
  app.use(cookieParser());
  app.use(
    cors({
      origin: ["https://localhost:3000", "http://localhost:3000"],
      credentials: true,
    })
  );

  app.use((req, res, next) => setRefreshToken(req, res, next));

  server.applyMiddleware({ app, cors: false });

  app.listen({ port: process.env.PORT }, () =>
    console.log(`Server ready at => http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
