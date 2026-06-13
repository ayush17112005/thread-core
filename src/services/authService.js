import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";
import { sendResetEmail } from "../utils/sendResetEmail.js";
import crypto from "crypto";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from "../utils/errors/customErrors.js";
const registerUserService = async (username, email, password) => {
  //Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ValidationError("Username or email already registered!!");
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
    throw new UnauthorizedError("Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  //IF the credentials are correct then give him tokens and let him in
  const { accessToken, refreshToken } = generateTokens(user);
  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.username,
    },
    accessToken,
    refreshToken,
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
    throw new NotFoundError("User not found");
  }
  return user;
};
const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return {
      message:
        "If a user with that email exists, a password reset link has been sent shortly",
    };
  }
  //Generate a password reset token and save it to the user's document
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiration = Date.now() + 10 * 60 * 1000; // This token will be valid for 10 minutes after issued
  await user.save();

  //We will send this resetToken to user's email in form of a link like this: https://frontend.com/reset-password?token=resetToken
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await sendResetEmail(email, resetLink);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    await user.save();
    throw error;
  }
  return {
    message:
      "If a user with that email exists, a password reset link has been sent shortly",
  };
};

const resetPasswordService = async (resetToken, newPassword) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiration: { $gt: Date.now() }, // Check if the token is not expired
  });
  if (!user) {
    throw new UnauthorizedError("Invalid or expired password reset token");
  }
  //Set the new Password of user
  user.password = newPassword;

  //clear the reset token and expiration time
  //Tiny mongodb hack: Setting these fields to undefined will remove them or ignore them when saving the document, so they won't be present in the database until a new reset token is generated
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiration = undefined;

  //Save the updated user document
  await user.save();
  return {
    message: "Password reset successful",
  };
};

export {
  registerUserService,
  loginUserService,
  getMeService,
  forgotPasswordService,
  refreshAccessTokenService,
  resetPasswordService,
};
