const express = require("express");
const Business = require("../models/Business");
const Review = require("../models/Review");
const User = require("../models/User");
const { requireAuth, attachUserIfPresent } = require("../middleware/auth");
const { scoreBusiness } = require("../utils/businessSearch");
const { attachCalculatedRatings } = require("../utils/businessRatings");
const { cloudinary } = require("../config/cloudinary");

const router = express.Router();

async function refreshBusinessStats(businessId) {
  const stats = await Review.aggregate([
    { $match: { businessId } },
    {
      $group: {
        _id: "$businessId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const nextStats = stats[0] || { averageRating: 0, reviewCount: 0 };

  await Business.findByIdAndUpdate(businessId, {
    ratingAverage: Number(nextStats.averageRating.toFixed ? nextStats.averageRating.toFixed(1) : nextStats.averageRating || 0),
    reviewCount: nextStats.reviewCount,
  });
}

router.get("/", async (req, res) => {
  try {
    const { search = "", category = "", location = "", sort = "", page = 1, limit = 12 } = req.query;
    const filter = { status: "approved", isActive: true };

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = new RegExp(location.trim(), "i");
    }

    let query = Business.find(filter);

    if (sort === "rating-desc") {
      query = query.sort({ ratingAverage: -1, reviewCount: -1 });
    } else if (sort === "rating-asc") {
      query = query.sort({ ratingAverage: 1 });
    } else if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ ratingAverage: -1, reviewCount: -1 });
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 12, 1), 50);
    let businesses = await query.lean();
    businesses = await attachCalculatedRatings(businesses);

    if (search.trim()) {
      businesses = businesses
        .map((business) => ({ ...business, ...scoreBusiness(business, search) }))
        .filter((business) => business.hasRelevantTerm)
        .sort((a, b) => b.score - a.score || Number(b.ratingAverage) - Number(a.ratingAverage));
    }

    const total = businesses.length;
    businesses = businesses
      .slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
      .map(({ score, terms, reasons, hasRelevantTerm, ...business }) => business);

    return res.json({
      success: true,
      businesses,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.log("Businesses fetch error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", attachUserIfPresent, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const isOwner = req.user && business.ownerId && business.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user?.role === "admin";
    if ((business.status !== "approved" || business.isActive !== true) && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    return res.json({
      success: true,
      business: {
        ...business,
        latitude: business.latitude ?? null,
        longitude: business.longitude ?? null,
      },
    });
  } catch (error) {
    console.log("Business detail error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      ownerId: req.user._id,
      status: "approved",
      isActive: true,
      rejectionReason: "",
      verifiedAt: null,
      services: Array.isArray(req.body.services) ? req.body.services : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      images: Array.isArray(req.body.images) ? req.body.images : [],
    };

    const business = await Business.create(payload);
    return res.status(201).json({
      success: true,
      businessId: business._id,
      business,
    });
  } catch (error) {
    console.log("Business create error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(({ message }) => message).join(" "),
      });
    }

    return res.status(500).json({ success: false, message: "Business could not be created. Please try again." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const isOwner = business.ownerId && business.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this business" });
    }

    const {
      _id,
      ownerId,
      status,
      rejectionReason,
      verifiedAt,
      ratingAverage,
      reviewCount,
      createdAt,
      updatedAt,
      __v,
      ...editableFields
    } = req.body;
    const payload = {
      ...editableFields,
      ownerId: business.ownerId,
      status: business.status || "pending",
      isActive: business.isActive !== false,
      rejectionReason: business.rejectionReason || "",
      verifiedAt: business.verifiedAt || null,
      services: Array.isArray(req.body.services) ? req.body.services : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      images: Array.isArray(req.body.images) ? req.body.images : [],
    };

    const updatedBusiness = await Business.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (business.imagePublicId && payload.imagePublicId && business.imagePublicId !== payload.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(business.imagePublicId, { resource_type: "image" });
      } catch (deleteError) {
        console.log("Previous image cleanup error:", deleteError.message);
      }
    }

    return res.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.log("Business update error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const isOwner = business.ownerId && business.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this business" });
    }

    await Business.findByIdAndDelete(req.params.id);

    await Review.deleteMany({ businessId: req.params.id });
    await User.updateMany(
      { favorites: req.params.id },
      { $pull: { favorites: req.params.id } }
    );

    if (business.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(business.imagePublicId, { resource_type: "image" });
      } catch (deleteError) {
        console.log("Deleted image cleanup error:", deleteError.message);
      }
    }

    return res.json({ success: true, message: "Business deleted successfully" });
  } catch (error) {
    console.log("Business delete error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const reviews = await Review.find({ businessId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log("Business reviews fetch error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/:id/reviews", requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const normalizedRating = Number(rating);
    const normalizedComment = typeof comment === "string" ? comment.trim() : "";

    if (!normalizedComment) {
      return res.status(400).json({ success: false, message: "Please add a comment" });
    }

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ success: false, message: "Please choose a rating from 1 to 5" });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const existingReview = await Review.findOne({
      businessId: req.params.id,
      userId: req.user._id,
    });

    let review;
    if (existingReview) {
      existingReview.rating = normalizedRating;
      existingReview.comment = normalizedComment;
      existingReview.userName = req.user.name;
      existingReview.userLocation = req.user.location;
      review = await existingReview.save();
    } else {
      review = await Review.create({
        businessId: req.params.id,
        userId: req.user._id,
        userName: req.user.name,
        userLocation: req.user.location,
        rating: normalizedRating,
        comment: normalizedComment,
      });
    }

    await refreshBusinessStats(req.params.id);

    const reviews = await Review.find({ businessId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const updatedBusiness = await Business.findById(req.params.id).lean();

    return res.status(existingReview ? 200 : 201).json({
      success: true,
      message: existingReview ? "Review updated successfully" : "Review added successfully",
      review,
      reviews,
      business: updatedBusiness,
    });
  } catch (error) {
    console.log("Review create error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:businessId/reviews/:reviewId", requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const isAuthor = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await review.deleteOne();
    await refreshBusinessStats(req.params.businessId);

    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.log("Review delete error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = {
  router,
  refreshBusinessStats,
};
