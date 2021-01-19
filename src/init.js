require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = mongoose.model("User");

module.exports = async function () {
  const item = await User.findOne({
    email: process.env.ADMIN_ACCOUNT,
  }).catch((erro) => console.log(erro));

  // Hash the Password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  if (!item) {
    await User.create({
      email: process.env.ADMIN_ACCOUNT,
      password: hashedPassword,
      userName: process.env.ADMIN_USERNAME,
      profilePicture: process.env.ADMIN_PICTURES,
      role: "Admin",
      thirdParty: "None",
    });
  }
};
