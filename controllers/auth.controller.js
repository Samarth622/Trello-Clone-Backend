import User from "../models/user.model.js";
import { generateToken } from "../utils/generateJWT.js";

export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const newUser = await User.create({ email, name, password });

    return res.status(201).json({
      message: "User registered successfully.",
      userId: newUser._id,
      email: newUser.email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = generateToken(user._id, email);

    return res.status(200).json({
      message: "Login successfully.",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
};
