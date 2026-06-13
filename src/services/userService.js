import { User } from "../models/userSchema.js";
import {
  NotFoundError,
  ValidationError,
} from "../utils/errors/customErrors.js";
const updateUserProfileService = async (userId, updatedData) => {
  if (updatedData.username) {
    const existingUser = await User.findOne({ username: updatedData.username });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ValidationError("Username already taken");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updatedData },
    { new: true },
  ).select("-password");

  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  return updatedUser;
};

export { updateUserProfileService };
