import {
  registerUserService,
  loginUserService,
  getMeService,
  refreshAccessTokenService,
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
    const { user, accessToken } = await loginUserService(email, password, res);
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
export { registerUser, loginUser, getMe, refreshAccessToken };
