const express = require("express");

const {
  getMarketplaceProducts,
  getMarketplaceProductById,
  sellFoodToMarketplace,
  deleteMarketplaceProduct,
} = require("../controllers/marketplaceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMarketplaceProducts);
router.get("/:id", getMarketplaceProductById);
router.post("/sell/:foodId", sellFoodToMarketplace);
router.delete("/:id", deleteMarketplaceProduct);

module.exports = router;