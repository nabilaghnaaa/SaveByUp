const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  createExpiryNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.post("/expiry/generate", createExpiryNotifications);
router.patch("/:id/read", markNotificationAsRead);

module.exports = router;