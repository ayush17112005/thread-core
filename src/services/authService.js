import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";
const registerUserService = async (username, email, password) => {
  //Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error("Username or email already registered!!");
  }
  //Create new user
  const newUser = new User({ username, email, password });
  await newUser.save();
  return newUser;
};

const loginUserService = async (email, password, res) => {
  //see if this email is in db or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  //IF the credentials are correct then give him token and let him in
  const accessToken = generateTokens(user, res);
  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.username,
    },
    accessToken,
  };
};

//When accessToken expires, frontend will hit this endpoint to get a new access token
const refreshAccessTokenService = async (refreshToken) => {
  //Verify the refrest token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const newAccessToken = jwt.sign(
    { sub: decoded.sub },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" },
  );
  return newAccessToken;
};

const getMeService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export {
  registerUserService,
  loginUserService,
  getMeService,
  refreshAccessTokenService,
};
