import {
  registerUserService,
  loginUserService,
  getMeService,
  refreshAccessTokenService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/authService.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  ValidationError,
  UnauthorizedError,
} from "../utils/errors/customErrors.js";

//Note express will pass the argu to fuction as (req, res, next);
//so we just can't write the parameter in any order we have to follow this order(req, res, next)
//else we have to face the consequences:)
const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ValidationError("Please provide all fields");
  }
  const newUser = await registerUserService(username, email, password);
  return res.status(201).json({
    success: true,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    },
    message: "User registered successfully",
  });
});

const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ValidationError("Please provide all fields");
  }
  const { user, accessToken, refreshToken } = await loginUserService(
    email,
    password,
  );

  // THE CONTROLLER sets the cookie using the Express 'res' object
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    user,
    accessToken,
  });
});

//Logout functionality: will implement later
const logOut = catchAsync(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged Out" });
});
const refreshAccessToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new UnauthorizedError("No refresh token provided");
  }
  const newAccessToken = await refreshAccessTokenService(refreshToken);
  return res.status(200).json({ success: true, accessToken: newAccessToken });
});
const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await getMeService(userId);
  return res.status(200).json({
    success: true,
    user,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ValidationError("Please provide an email");
  }
  const result = await forgotPasswordService(email);
  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const { newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ValidationError("Please provide all fields");
  }
  const result = await resetPasswordService(token, newPassword);
  return res.status(200).json({
    success: true,
    message: result.message,
  });
});
export {
  registerUser,
  loginUser,
  getMe,
  refreshAccessToken,
  logOut,
  forgotPassword,
  resetPassword,
};
