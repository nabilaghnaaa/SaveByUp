const express = require("express");

const {
  getTransactions,
  shareTransactionLocation,
  completeTransaction,
  rateTransaction,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTransactions);

router.patch("/:id/share-location", shareTransactionLocation);

router.patch("/:id/complete", completeTransaction);

router.patch("/:id/rate", rateTransaction);

module.exports = router;