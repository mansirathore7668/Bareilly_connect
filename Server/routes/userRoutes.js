const express = require("express");
const Business = require("../models/Business");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      location: req.user.location,
      role: req.user.role,
      favorites: req.user.favorites || [],
    },
  });
});

router.get("/me/favorites", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    favorites: req.user.favorites || [],
  });
});

router.get("/me/businesses", requireAuth, async (req, res) => {
  try {
    const businesses = await Business.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .select("name category location city image status rejectionReason ratingAverage reviewCount createdAt")
      .lean();

    return res.json({ success: true, businesses });
  } catch (error) {
    console.log("Owned businesses error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/favorites/:businessId", requireAuth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favorites: req.params.businessId },
    });

    const updatedUser = await User.findById(req.user._id).populate("favorites");

    return res.json({
      success: true,
      message: "Added to favorites",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Favorite add error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/favorites/:businessId", requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favorites: req.params.businessId },
    });

    const updatedUser = await User.findById(req.user._id).populate("favorites");

    return res.json({
      success: true,
      message: "Removed from favorites",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Favorite remove error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
