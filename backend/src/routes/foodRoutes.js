const express = require("express");

const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  updateFoodStatus,
  deleteFood,
  getFoodSummary,
  getFoodHistory,
} = require("../controllers/foodController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", getFoodSummary);
router.get("/history", getFoodHistory);

router.get("/", getFoods);
router.get("/:id", getFoodById);
router.post("/", createFood);
router.put("/:id", updateFood);
router.patch("/:id/status", updateFoodStatus);
router.delete("/:id", deleteFood);

module.exports = router;