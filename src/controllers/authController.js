import { registerUserService } from "../services/authService.js";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    const newUser = await registerUserService(username, email, password);
    res.status(201).json({
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
      return res.status(400).json({ message: e.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export { registerUser };
