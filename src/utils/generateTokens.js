import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  //Short Lived Access Token
  const accessToken = jwt.sign(
    { sub: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  //Long lived Refresh Token
  const refreshToken = jwt.sign(
    { sub: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return { accessToken, refreshToken };
};
