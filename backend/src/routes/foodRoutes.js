const express = require('express');
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodSummary,
} = require('../controllers/foodController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getFoodSummary);
router.get('/', getFoods);
router.get('/:id', getFoodById);
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

module.exports = router;