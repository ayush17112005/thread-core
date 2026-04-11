import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
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

const loginUserService = async (email, password) => {
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
  const token = jwt.sign(
    {
      sub: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }, //because it's a access token it's lifespan is short, we will create refresh token in future which will have longer lifespan
  );
  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.username,
    },
    token,
  };
};
export { registerUserService, loginUserService };
