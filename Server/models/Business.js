const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    latitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },

    openingHours: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    facebook: {
      type: String,
      default: "",
      trim: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    mapUrl: {
      type: String,
      default: "",
      trim: true,
    },

    establishedYear: {
      type: String,
      default: "",
      trim: true,
    },

    services: [
      {
        type: String,
        trim: true,
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    image: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    ratingAverage: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.index({ status: 1, category: 1, location: 1 });
businessSchema.index({ ownerId: 1, createdAt: -1 });

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
