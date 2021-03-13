require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = mongoose.model("User");

module.exports = async function () {
  const users = process.env.ADMIN_ACCOUNT.split("-");
  const passwords = process.env.ADMIN_PASSWORD.split("-");
  const usernames = process.env.ADMIN_USERNAME.split("-");
  const pictures = process.env.ADMIN_PICTURES.split(" ");

  users.map(async (user, index) => {
    const item = await User.findOne({ email: user }).catch((erro) =>
      console.log(erro)
    );

    // Hash the Password
    const hashedPassword = await bcrypt.hash(passwords[index], 10);

    if (!item) {
      await User.create({
        email: user,
        password: hashedPassword,
        userName: usernames[index],
        profilePicture: pictures[index],
        role: "Admin",
        thirdParty: "None",
      });
    }
  });
};
