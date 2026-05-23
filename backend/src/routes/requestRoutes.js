const express = require("express");

const {
  createPurchaseRequest,
  getIncomingRequests,
  getMyRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/incoming", getIncomingRequests);
router.get("/mine", getMyRequests);
router.post("/:productId", createPurchaseRequest);
router.patch("/:id/approve", approveRequest);
router.patch("/:id/reject", rejectRequest);

module.exports = router;