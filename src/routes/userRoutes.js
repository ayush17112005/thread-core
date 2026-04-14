import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { updateUserProfileController } from "../controllers/userController.js";
const router = express.Router();

router.put(
  "/profile",
  protectRoute,
  upload.single("profile"),
  updateUserProfileController,
);

export default router;
