import { User } from "../models/userSchema.js";

const updateUserProfileService = async (userId, updatedData) => {
  if (updatedData.username) {
    const existingUser = await User.findOne({ username: updatedData.username });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error("Username already taken");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updatedData },
    { new: true },
  ).select("-password");

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

export { updateUserProfileService };
