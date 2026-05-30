import {
  registerUserService,
  loginUserService,
  getMeService,
  refreshAccessTokenService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/authService.js";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
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
  } catch (e) {
    //here we are using these if conditions to catch the specific error thrown from the service layer which is not good
    //but for now we will do it like this, later we can implement a better error handling mechanism using custom error classes and an error handling middleware
    if (e.message === "Username or email already registered!!") {
      return res.status(401).json({ message: e.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
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
  } catch (e) {
    if (e.message === "Invalid email or password") {
      return res.status(401).json({ message: e.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

//Logout functionality: will implement later
const logOut = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged Out" });
};
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const newAccessToken = await refreshAccessTokenService(refreshToken);
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Refresh token expired" });
    }
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getMeService(userId);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (e) {
    if (e.message === "User not found") {
      return res.status(404).json({ message: e.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }
    const result = await forgotPasswordService(email);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (e) {
    //Look how we have to catch the specific error thrown from the service layer to send and it's the bad practice,
    // we should implement a better error handling mechanism using custom error classes and an error handling middleware
    if (
      e.message ===
      "If a user with that email exists, a password reset link has been sent shortly"
    ) {
      return res.status(200).json({ message: e.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const result = await resetPasswordService(token, newPassword);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (e) {
    if (e.message === "Invalid or expired password reset token") {
      return res.status(400).json({ message: e.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};
export {
  registerUser,
  loginUser,
  getMe,
  refreshAccessToken,
  logOut,
  forgotPassword,
  resetPassword,
};
