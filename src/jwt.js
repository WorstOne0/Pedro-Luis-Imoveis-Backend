const jwt = require("jsonwebtoken");
const User = require("./models/User");

const createToken = (user) => {
  const refreshToken = jwt.sign(
    { userId: user._id, count: user.count },
    process.env.REFRESH_TOKEN_JWT,
    {
      expiresIn: "7d",
    }
  );

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_JWT,
    {
      expiresIn: "15s",
    }
  );

  return { accessToken, refreshToken };
};

const setRefreshToken = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken && !refreshToken) return next();

  try {
    const data = jwt.verify(accessToken, process.env.ACCESS_TOKEN_JWT);
    req.userId = data.userId;
    return next();
  } catch {}

  if (!refreshToken) return next();

  let dataRefresh;
  try {
    dataRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_JWT);
  } catch {
    return next();
  }

  User.findOne({ _id: dataRefresh.userId }, (error, user) => {
    if (!user || user.count !== dataRefresh.count) return next();

    const { accessToken, refreshToken } = createToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
    });

    req.userId = user._id;

    next();
  });
};

module.exports = { setRefreshToken, createToken };
