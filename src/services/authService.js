import { User } from "../models/userSchema.js";

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

export { registerUserService };
