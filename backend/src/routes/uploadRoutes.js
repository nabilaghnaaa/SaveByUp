const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `food-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Format file harus JPG, PNG, atau WEBP."), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.post(
  "/food-image",
  authMiddleware,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "File gambar wajib diunggah.",
        });
      }

      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      return res.status(201).json({
        message: "Foto makanan berhasil diunggah.",
        data: {
          image_url: imageUrl,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Gagal mengunggah foto makanan.",
        error: error.message,
      });
    }
  }
);

module.exports = router;