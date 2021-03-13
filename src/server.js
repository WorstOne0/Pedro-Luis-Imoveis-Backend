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

  require("./init.js")();

  const app = express();
  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        "https://localhost:3000",
        "http://localhost:3000",
        "https://master.dusbcq0i4znm6.amplifyapp.com",
        "http://master.dusbcq0i4znm6.amplifyapp.com",
        "http://pedroluisimoveis.com.br",
        "http://www.pedroluisimoveis.com.br",
        "https://pedroluisimoveis.com.br",
        "https://www.pedroluisimoveis.com.br",
      ],
      credentials: true,
    })
  );

  app.use((req, res, next) => setRefreshToken(req, res, next));

  server.applyMiddleware({ app, cors: false });

  app.listen({ port: process.env.PORT }, () =>
    console.log(
      `Server ready at => http://localhost:${process.env.PORT}${server.graphqlPath}`
    )
  );
};

startServer();
