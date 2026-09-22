require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const businessRoutes = require("./routes/businessRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const Business = require("./models/Business");
const User = require("./models/User");
const { requireAuth } = require("./middleware/auth");
const { signToken } = require("./utils/jwt");
const seedBusinesses = require("./data/seedBusinesses");
const { refreshBusinessStats } = require("./routes/businessRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bareilly-connect-1.vercel.app",
        "https://bareilly-connect.vercel.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

      const isLocalDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

      if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to LocalConnect-ai Backend");
});

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

app.post("/auth/register", async (req, res) => {
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

app.post("/auth/login", async (req, res) => {
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

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.json({ success: true, message: "Logged out successfully" });
});

app.get("/auth/me", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: buildUserPayload(req.user),
  });
});

app.use("/businesses", businessRoutes.router);
app.use("/upload", uploadRoutes);
app.use("/ai", aiRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

async function seedDatabase() {
  const count = await Business.countDocuments();

  if (count === 0) {
    await Business.insertMany(
      seedBusinesses.map((business) => ({
        ...business,
        status: "approved",
        isActive: true,
      }))
    );

    const businesses = await Business.find();
    await Promise.all(businesses.map((business) => refreshBusinessStats(business._id)));
  }

  await Business.updateMany(
    { status: { $exists: false } },
    { $set: { status: "approved", rejectionReason: "", verifiedAt: new Date() } }
  );
}

async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@localconnect.ai").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: "LocalConnect Admin",
    email: adminEmail,
    location: "LocalConnect HQ",
    password: hashedPassword,
    role: "admin",
  });
}

async function startServer() {
  try {
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/localconnect_ai");
    console.log("MongoDB connected");

    await seedDatabase();
    await seedAdminUser();

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
}

startServer();
