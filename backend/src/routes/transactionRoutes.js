const express = require("express");

const {
  getTransactions,
  completeTransaction,
  rateTransaction,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTransactions);
router.patch("/:id/complete", completeTransaction);
router.patch("/:id/rating", rateTransaction);

module.exports = router;