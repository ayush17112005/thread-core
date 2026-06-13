import { uploadToCloudinaryService } from "../services/uploadService.js";
import { updateUserProfileService } from "../services/userService.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  NotFoundError,
  ValidationError,
} from "../utils/errors/customErrors.js";
const updateUserProfileController = catchAsync(async (req, res, next) => {
  const { username, bio } = req.body;
  const userId = req.user.id;
  let updatedData = {};

  if (username) updatedData.username = username;
  if (bio) updatedData.bio = bio;
  if (!req.file && Object.keys(updatedData).length === 0) {
    throw new ValidationError("No data provided for update");
  }

  if (req.file) {
    const result = await uploadToCloudinaryService(req.file.buffer);
    updatedData.profile = result.secure_url;
  }

  const updatedUser = await updateUserProfileService(userId, updatedData);
  res
    .status(200)
    .json({ message: "Profile updated successfully", user: updatedUser });
});

export { updateUserProfileController };
