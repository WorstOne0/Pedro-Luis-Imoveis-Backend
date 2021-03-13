const { ApolloError, ValidationError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

const { createToken } = require("../jwt");
const User = require("../models/User");
const Post = require("../models/Post");

module.exports = {
  Query: {
    users: () => User.find(),

    getUser: (_, { userId }) => {
      return User.findOne({ _id: userId });
    },

    getLoggedUser: async (_, __, { req }) => {
      if (!req.userId) return null;

      const user = await User.findOne({ _id: req.userId });

      return user;
    },
  },

  Mutation: {
    createUser: async (
      _,
      { email, password, userName, thirdParty, reCaptchaToken }
    ) => {
      try {
        /*// ReCaptcha
        const res = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY_SECRET}&response=${reCaptchaToken}`,
          { method: "POST" }
        );

        const { success } = await res.json();
        if (!success) throw new ApolloError("Robot Detected");*/

        // Hash the Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a User
        const user = new User({
          email,
          password: hashedPassword,
          userName,
          role: "User",
          thirdParty,
        });

        return await user.save();
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    emailExists: async (_, { email }) => {
      // Try to find e user with the Email
      const user = await User.findOne({ email });

      if (user) return true;

      return false;
    },

    userNameExists: async (_, { userName }) => {
      // Try to find e user with the UserName
      const user = await User.findOne({ userName });

      if (user) return true;

      return false;
    },
    updateUser: async () => {},
    login: async (
      _,
      { email, password, thirdParty, thirdPartyPayloadJSON, reCaptchaToken },
      { res }
    ) => {
      if (thirdParty === "None") {
        try {
          /*// ReCaptcha
          const reCaptcha = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY_SECRET}&response=${reCaptchaToken}`,
            { method: "POST" }
          );

          const { success } = await reCaptcha.json();
          if (!success) throw new ApolloError("Robot Detected");*/

          // Try to find e user
          const user = await User.findOne({ email });

          if (!user) return null;

          // Decrypt the Passwordnm gf
          if (!(await bcrypt.compare(password, user.password))) return null;
          00;

          // Create Tokens
          const { accessToken, refreshToken } = createToken(user);

          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });

          return user;
        } catch (error) {
          throw new ApolloError(error);
        }
      }

      if (thirdParty === "Google") {
        const { idToken } = JSON.parse(thirdPartyPayloadJSON);

        const client = new OAuth2Client(process.env.CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();

        /*const user = await User.findOne({ email: payload["email"] });

        if(!user) {
          const hashedPassword = await bcrypt.hash("Google_User_Random_Password", 10);

          const newUser = new User({
            email,
            password: hashedPassword,
            userName,
            screenName,
            thirdParty,
          });
  
          return await newUser.save();
        }

        return user;*/
      }
    },
    logout: async (_, __, { req, res }) => {
      // If has no User
      if (!req.userId) return false;

      // Verify the User
      const user = await User.findOne({ _id: req.userId });

      if (!user) return false;

      // Delete the Tokens
      user.count += 1;
      await user.save();

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return true;
    },

    sendEmail: async (_, { subject, email, text }, { req, res }) => {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ACCOUNT,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      try {
        const info = await transporter.sendMail({
          from: "sendEmailPedroLuis@gmail.com",
          to: "luccagabriel12@hotmail.com",
          subject: subject,
          html: text,
        });

        return true;
      } catch (error) {
        return false;
      }
    },
  },

  User: {
    async posts(user) {
      try {
        return await Post.find({ postedBy: user.id });
      } catch (error) {
        throw new ValidationError("User ID not found");
      }
    },
  },
};
