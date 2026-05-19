import jwt from "jsonwebtoken";

export const generateTokens = (user, res) => {
  //Short Lived Access Token
  const accessToken = jwt.sign(
    { sub: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
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

  // Refresh token goes in httpOnly cookie — JS can never touch this
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return accessToken;
};
