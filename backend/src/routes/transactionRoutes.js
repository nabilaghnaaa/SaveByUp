const express = require("express");

const {
  getTransactions,
  confirmTransactionLocation,
  completeTransaction,
  rateTransaction,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTransactions);

router.patch("/:id/confirm-location", confirmTransactionLocation);

router.patch("/:id/complete", completeTransaction);

router.patch("/:id/rate", rateTransaction);

module.exports = router;