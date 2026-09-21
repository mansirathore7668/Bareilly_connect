const express = require("express");
const Business = require("../models/Business");
const Review = require("../models/Review");
const User = require("../models/User");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [businesses, reviews, users, admins] = await Promise.all([
      Business.countDocuments(),
      Review.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    return res.json({
      success: true,
      stats: { businesses, reviews, users, admins },
    });
  } catch (error) {
    console.log("Admin stats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/reviews", requireAuth, requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("businessId", "name category image")
      .populate("userId", "name email location")
      .lean();

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("Admin reviews error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/businesses/pending", requireAuth, requireAdmin, async (req, res) => {
  try {
    const businesses = await Business.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("ownerId", "name email")
      .lean();

    return res.json({ success: true, businesses });
  } catch (error) {
    console.log("Pending businesses error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/businesses/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason = "" } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid business status" });
    }

    const business = await Business.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        status,
        isActive: status === "approved" ? true : undefined,
        rejectionReason: status === "rejected" ? String(rejectionReason).trim() : "",
        verifiedAt: status === "approved" ? new Date() : null,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!business) {
      const existingBusiness = await Business.findById(req.params.id).select("status").lean();
      if (!existingBusiness) {
        return res.status(404).json({ success: false, message: "Business not found" });
      }
      return res.status(409).json({ success: false, message: "Only pending businesses can be moderated" });
    }

    return res.json({ success: true, business });
  } catch (error) {
    console.log("Business status error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email location role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Admin users error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
