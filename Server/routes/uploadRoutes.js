const express = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const { cloudinary, assertCloudinaryConfig } = require("../config/cloudinary");

const router = express.Router();
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedDetectedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, and WEBP images are allowed."));
    }

    return callback(null, true);
  },
});

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bareilly-connects/businesses",
        resource_type: "image",
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(buffer);
  });
}

router.post("/image", requireAuth, (req, res) => {
  upload.single("image")(req, res, async (uploadError) => {
    if (uploadError) {
      const isFileTooLarge = uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE";
      return res.status(400).json({
        success: false,
        message: isFileTooLarge ? "Image must be 5 MB or smaller." : uploadError.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image to upload." });
    }

    try {
      const { fileTypeFromBuffer } = await import("file-type");
      const detectedType = await fileTypeFromBuffer(req.file.buffer);

      if (!detectedType || !allowedDetectedTypes.has(detectedType.mime)) {
        return res.status(400).json({
          success: false,
          message: "The selected file is not a valid JPG, PNG, or WEBP image.",
        });
      }

      assertCloudinaryConfig();
      const result = await uploadBuffer(req.file.buffer);

      return res.status(201).json({
        success: true,
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.log("Image upload error:", error.message);
      return res.status(502).json({ success: false, message: "Could not upload image right now." });
    }
  });
});

module.exports = router;
