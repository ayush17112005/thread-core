import { uploadToCloudinaryService } from "../services/uploadService.js";
import { updateUserProfileService } from "../services/userService.js";
const updateUserProfileController = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const userId = req.user.id;
    let updatedData = {};

    if (username) updatedData.username = username;
    if (bio) updatedData.bio = bio;
    if (!req.file && Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    if (req.file) {
      try {
        const result = await uploadToCloudinaryService(req.file.buffer);
        updatedData.profile = result.secure_url;
      } catch (e) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const updatedUser = await updateUserProfileService(userId, updatedData);
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (e) {
    if (e.message === "User not found") {
      return res.status(404).json({ error: e.message });
    }
    if (e.message === "Username already taken") {
      return res.status(400).json({ error: e.message });
    }
    res.status(500).json({ error: e.message });
  }
};

export { updateUserProfileController };

