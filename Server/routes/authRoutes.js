const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function buildUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    location: user.location,
    role: user.role,
    favorites: user.favorites || [],
  };
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, location, password } = req.body;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedLocation = typeof location === "string" ? location.trim() : "";
    const trimmedPassword = typeof password === "string" ? password : "";

    if (!trimmedName || !trimmedEmail || !trimmedLocation || !trimmedPassword) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    if (trimmedPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      location: trimmedLocation,
      password: hashedPassword,
    });

    const populatedUser = await User.findById(user._id).populate("favorites");
    const token = signToken(
      {
        sub: populatedUser._id.toString(),
        email: populatedUser.email,
        name: populatedUser.name,
        role: populatedUser.role,
      },
      process.env.JWT_SECRET || "localconnect-secret"
    );

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: buildUserPayload(populatedUser),
    });
  } catch (error) {
    console.log("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedPassword = typeof password === "string" ? password : "";

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const user = await User.findOne({ email: trimmedEmail }).populate("favorites");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(trimmedPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(
      {
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "localconnect-secret"
    );

    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: "Login successful",
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.json({ success: true, message: "Logged out successfully" });
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: buildUserPayload(req.user),
  });
});

module.exports = router;
