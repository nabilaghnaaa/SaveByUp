const {
  getFoodsByUser,
  getFoodDetailByUser,
  createFoodByUser,
  updateFoodByUser,
  updateFoodStatusByUser,
  deleteFoodByUser,
  getFoodSummaryByUser,
} = require("../services/foodInventory.service");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const handleControllerError = (res, error, logMessage) => {
  console.error(logMessage, error);

  return res.status(error.statusCode || 500).json({
    message: error.publicMessage || "Terjadi kesalahan pada server",
    error: error.message,
  });
};

const getFoods = async (req, res) => {
  try {
    const userId = getUserId(req);

    const data = await getFoodsByUser(userId);

    return res.status(200).json({
      message: "Data makanan berhasil diambil",
      data,
    });
  } catch (error) {
    return handleControllerError(res, error, "Get foods error:");
  }
};

const getFoodById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const data = await getFoodDetailByUser(id, userId);

    return res.status(200).json({
      message: "Detail makanan berhasil diambil",
      data,
    });
  } catch (error) {
    return handleControllerError(res, error, "Get food by id error:");
  }
};

const createFood = async (req, res) => {
  try {
    const userId = getUserId(req);

    const data = await createFoodByUser(req.body, userId);

    return res.status(201).json({
      message: "Data makanan berhasil ditambahkan",
      data,
    });
  } catch (error) {
    return handleControllerError(res, error, "Create food error:");
  }
};

const updateFood = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const data = await updateFoodByUser(id, req.body, userId);

    return res.status(200).json({
      message: "Data makanan berhasil diperbarui",
      data,
    });
  } catch (error) {
    return handleControllerError(res, error, "Update food error:");
  }
};

const updateFoodStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const result = await updateFoodStatusByUser(id, req.body, userId);

    return res.status(200).json(result);
  } catch (error) {
    return handleControllerError(res, error, "Update food status error:");
  }
};

const deleteFood = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    await deleteFoodByUser(id, userId);

    return res.status(200).json({
      message: "Data makanan berhasil dihapus",
    });
  } catch (error) {
    return handleControllerError(res, error, "Delete food error:");
  }
};

const getFoodSummary = async (req, res) => {
  try {
    const userId = getUserId(req);

    const data = await getFoodSummaryByUser(userId);

    return res.status(200).json({
      message: "Ringkasan makanan berhasil diambil",
      data,
    });
  } catch (error) {
    return handleControllerError(res, error, "Get food summary error:");
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  updateFoodStatus,
  deleteFood,
  getFoodSummary,
};