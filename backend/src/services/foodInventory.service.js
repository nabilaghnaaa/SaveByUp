const db = require("../config/db");

const {
  TERMINAL_FOOD_STATUS,
  PARTIAL_ACTION_STATUS,
  ALLOWED_FOOD_STATUS,
  mapStatusToCondition,
  calculateFoodStatus,
  normalizeFood,
  validateFoodPayload,
} = require("../utils/foodStatus.util");

const {
  cancelActiveMarketplaceByFood,
  getFoodMarketplaceState,
  enrichFoodWithMarketplaceState,
  enrichFoodsWithMarketplaceState,
} = require("./foodMarketplace.service");

const { createStockLog } = require("./foodStockLog.service");
const { buildSummaryFromFoods } = require("./foodSummary.service");

const createHttpError = (statusCode, publicMessage) => {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
};

const ensureAuthenticated = (userId) => {
  if (!userId) {
    throw createHttpError(401, "User tidak terautentikasi.");
  }
};

const getFoodByOwner = async (foodId, userId) => {
  const [foods] = await db.query(
    "SELECT * FROM foods WHERE id = ? AND user_id = ?",
    [foodId, userId]
  );

  return foods[0] || null;
};

const getRecalculatedAvailableStatus = (food) => {
  const recalculated = calculateFoodStatus(food.expiry_date, "");

  return {
    status: recalculated.status,
    priority: recalculated.priority,
    condition_status:
      recalculated.condition_status || mapStatusToCondition(recalculated.status),
  };
};

const getFinalStatusAfterStockReduction = ({
  currentFood,
  remainingQuantity,
  activeMarketplaceQuantity,
  actionStatus,
}) => {
  if (remainingQuantity <= 0) {
    return {
      status: actionStatus,
      priority: actionStatus === "dibuang" ? "tidak_layak" : "selesai",
      condition_status: mapStatusToCondition(actionStatus),
    };
  }

  if (activeMarketplaceQuantity > 0) {
    return {
      status: "dijual",
      priority: "sedang",
      condition_status: mapStatusToCondition("dijual"),
    };
  }

  return getRecalculatedAvailableStatus(currentFood);
};

const normalizeFoodInput = (body = {}) => {
  const {
    name,
    category,
    quantity,
    unit = "pcs",
    price,
    storage_location = "",
    purchase_date = null,
    expiry_date,
    note = "",
    notes = "",
    image_url = "",
    image = "",
    status = "",
  } = body;

  return {
    name,
    category,
    quantity,
    unit,
    price,
    storage_location,
    purchase_date,
    expiry_date,
    note,
    notes,
    image_url,
    image,
    status,
    finalNote: note || notes || "",
    finalImage: image_url || image || "",
  };
};

const validateFoodInput = (foodInput) => {
  const validationMessage = validateFoodPayload({
    name: foodInput.name,
    quantity: foodInput.quantity,
    unit: foodInput.unit,
    price: foodInput.price,
    expiry_date: foodInput.expiry_date,
  });

  if (validationMessage) {
    throw createHttpError(400, validationMessage);
  }
};

const getFoodsByUser = async (userId) => {
  ensureAuthenticated(userId);

  const [foods] = await db.query(
    "SELECT * FROM foods WHERE user_id = ? ORDER BY expiry_date ASC",
    [userId]
  );

  const enrichedFoods = await enrichFoodsWithMarketplaceState(foods, userId);

  return enrichedFoods.map(normalizeFood);
};

const getFoodDetailByUser = async (foodId, userId) => {
  ensureAuthenticated(userId);

  const food = await getFoodByOwner(foodId, userId);

  if (!food) {
    throw createHttpError(404, "Data makanan tidak ditemukan");
  }

  const enrichedFood = await enrichFoodWithMarketplaceState(food, userId);

  return normalizeFood(enrichedFood);
};

const createFoodByUser = async (body, userId) => {
  ensureAuthenticated(userId);

  const foodInput = normalizeFoodInput(body);
  validateFoodInput(foodInput);

  const calculated = calculateFoodStatus(foodInput.expiry_date, foodInput.status);

  const [insertResult] = await db.query(
    `INSERT INTO foods
    (
      user_id,
      name,
      category,
      quantity,
      unit,
      price,
      storage_location,
      purchase_date,
      expiry_date,
      condition_status,
      status,
      priority,
      notes,
      image,
      note,
      image_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      String(foodInput.name || "").trim(),
      foodInput.category || null,
      Number(foodInput.quantity),
      foodInput.unit || "pcs",
      Number(foodInput.price),
      foodInput.storage_location || null,
      foodInput.purchase_date || null,
      foodInput.expiry_date,
      calculated.condition_status || mapStatusToCondition(calculated.status),
      calculated.status,
      calculated.priority,
      foodInput.finalNote,
      foodInput.finalImage,
      foodInput.finalNote,
      foodInput.finalImage,
    ]
  );

  return {
    id: insertResult.insertId,
  };
};

const updateFoodByUser = async (foodId, body, userId) => {
  ensureAuthenticated(userId);

  const foodInput = normalizeFoodInput(body);
  validateFoodInput(foodInput);

  const existingFood = await getFoodByOwner(foodId, userId);

  if (!existingFood) {
    throw createHttpError(404, "Data makanan tidak ditemukan");
  }

  const marketplaceState = await getFoodMarketplaceState(foodId, userId);
  const calculated = calculateFoodStatus(foodInput.expiry_date, foodInput.status);

  const activeMarketplaceQuantity = Number(
    marketplaceState.activeMarketplaceQuantity || 0
  );

  const activeTransactions = Number(marketplaceState.activeTransactions || 0);

  if (
    TERMINAL_FOOD_STATUS.includes(calculated.status) &&
    activeTransactions > 0
  ) {
    throw createHttpError(
      400,
      "Makanan tidak bisa diubah menjadi digunakan/dibuang/terjual/kedaluwarsa karena masih ada transaksi COD yang berjalan."
    );
  }

  if (
    activeMarketplaceQuantity > 0 &&
    Number(foodInput.quantity) < activeMarketplaceQuantity
  ) {
    throw createHttpError(
      400,
      `Jumlah stok inventaris tidak boleh lebih kecil dari stok yang sedang aktif di marketplace. Stok aktif marketplace saat ini: ${activeMarketplaceQuantity}.`
    );
  }

  const shouldKeepSoldStatus =
    activeMarketplaceQuantity > 0 &&
    !TERMINAL_FOOD_STATUS.includes(calculated.status);

  const finalStatus = shouldKeepSoldStatus ? "dijual" : calculated.status;
  const finalPriority = shouldKeepSoldStatus ? "sedang" : calculated.priority;
  const finalConditionStatus =
    calculated.condition_status || mapStatusToCondition(calculated.status);

  await db.query(
    `UPDATE foods
     SET
      name = ?,
      category = ?,
      quantity = ?,
      unit = ?,
      price = ?,
      storage_location = ?,
      purchase_date = ?,
      expiry_date = ?,
      condition_status = ?,
      status = ?,
      priority = ?,
      notes = ?,
      image = ?,
      note = ?,
      image_url = ?
     WHERE id = ? AND user_id = ?`,
    [
      String(foodInput.name || "").trim(),
      foodInput.category || null,
      Number(foodInput.quantity),
      foodInput.unit || "pcs",
      Number(foodInput.price),
      foodInput.storage_location || null,
      foodInput.purchase_date || null,
      foodInput.expiry_date,
      finalConditionStatus,
      finalStatus,
      finalPriority,
      foodInput.finalNote,
      foodInput.finalImage,
      foodInput.finalNote,
      foodInput.finalImage,
      foodId,
      userId,
    ]
  );

  if (TERMINAL_FOOD_STATUS.includes(calculated.status)) {
    await cancelActiveMarketplaceByFood(foodId, userId);
  }

  const updatedFood = await getFoodByOwner(foodId, userId);
  const enrichedFood = await enrichFoodWithMarketplaceState(updatedFood, userId);

  return normalizeFood(enrichedFood);
};

const handlePartialStockAction = async ({
  foodId,
  userId,
  status,
  quantity,
  currentFood,
  marketplaceState,
}) => {
  if (!quantity || Number(quantity) <= 0) {
    throw createHttpError(
      400,
      `Jumlah makanan yang ${status} wajib diisi dan harus lebih dari 0.`
    );
  }

  const currentQuantity = Number(currentFood.quantity || 0);
  const activeMarketplaceQuantity = Number(
    marketplaceState.activeMarketplaceQuantity || 0
  );

  const freeInventoryQuantity = Math.max(
    currentQuantity - activeMarketplaceQuantity,
    0
  );

  const actionQuantity = Number(quantity);

  if (freeInventoryQuantity <= 0) {
    throw createHttpError(
      400,
      "Tidak ada stok bebas yang bisa digunakan/dibuang karena semua stok sedang aktif di marketplace."
    );
  }

  if (actionQuantity > freeInventoryQuantity) {
    throw createHttpError(
      400,
      `Jumlah yang ${status} melebihi stok bebas. Stok bebas yang bisa ${status}: ${freeInventoryQuantity} ${
        currentFood.unit || "pcs"
      }.`
    );
  }

  const remainingQuantity = Math.max(currentQuantity - actionQuantity, 0);

  const remainingFreeQuantity = Math.max(
    freeInventoryQuantity - actionQuantity,
    0
  );

  const finalState = getFinalStatusAfterStockReduction({
    currentFood,
    remainingQuantity,
    activeMarketplaceQuantity,
    actionStatus: status,
  });

  await db.query(
    `UPDATE foods
     SET
      quantity = ?,
      status = ?,
      priority = ?,
      condition_status = ?
     WHERE id = ? AND user_id = ?`,
    [
      remainingQuantity,
      finalState.status,
      finalState.priority,
      finalState.condition_status,
      foodId,
      userId,
    ]
  );

  await createStockLog({
    foodId,
    userId,
    action: status,
    quantity: actionQuantity,
    note: `${actionQuantity} ${currentFood.unit || "pcs"} ${
      currentFood.name
    } ${status}`,
  });

  const updatedFood = await getFoodByOwner(foodId, userId);
  const enrichedFood = await enrichFoodWithMarketplaceState(updatedFood, userId);

  return {
    message: `Stok makanan berhasil dikurangi karena ${status}.`,
    data: {
      food: normalizeFood(enrichedFood),
      food_id: Number(foodId),
      action: status,
      action_quantity: actionQuantity,
      previous_quantity: currentQuantity,
      remaining_quantity: remainingQuantity,
      active_marketplace_quantity: activeMarketplaceQuantity,
      free_inventory_quantity_before: freeInventoryQuantity,
      free_inventory_quantity_after: remainingFreeQuantity,
      final_status: finalState.status,
    },
  };
};

const handleFullStatusChange = async ({
  foodId,
  userId,
  status,
  currentFood,
  marketplaceState,
}) => {
  const activeMarketplaceQuantity = Number(
    marketplaceState.activeMarketplaceQuantity || 0
  );

  const activeTransactions = Number(marketplaceState.activeTransactions || 0);

  if (TERMINAL_FOOD_STATUS.includes(status) && activeTransactions > 0) {
    throw createHttpError(
      400,
      "Status makanan tidak bisa diubah karena masih ada transaksi COD yang berjalan."
    );
  }

  if (
    status !== "dijual" &&
    !TERMINAL_FOOD_STATUS.includes(status) &&
    activeMarketplaceQuantity > 0
  ) {
    throw createHttpError(
      400,
      "Status makanan tidak bisa diubah menjadi aman/mendekati kedaluwarsa karena makanan masih aktif di marketplace. Batalkan produk marketplace terlebih dahulu."
    );
  }

  if (status === "dijual" && activeMarketplaceQuantity <= 0) {
    throw createHttpError(
      400,
      "Status makanan tidak bisa diubah manual menjadi dijual karena belum ada produk aktif di marketplace."
    );
  }

  const calculated = calculateFoodStatus(currentFood.expiry_date, status);

  await db.query(
    `UPDATE foods
     SET
      status = ?,
      priority = ?,
      condition_status = ?
     WHERE id = ? AND user_id = ?`,
    [
      calculated.status,
      calculated.priority,
      calculated.condition_status || mapStatusToCondition(calculated.status),
      foodId,
      userId,
    ]
  );

  if (TERMINAL_FOOD_STATUS.includes(calculated.status)) {
    await cancelActiveMarketplaceByFood(foodId, userId);
  }

  const updatedFood = await getFoodByOwner(foodId, userId);
  const enrichedFood = await enrichFoodWithMarketplaceState(updatedFood, userId);

  return {
    message: "Status makanan berhasil diperbarui",
    data: normalizeFood(enrichedFood),
  };
};

const updateFoodStatusByUser = async (foodId, body, userId) => {
  ensureAuthenticated(userId);

  const { status, quantity } = body;

  if (!status) {
    throw createHttpError(400, "Status makanan wajib diisi.");
  }

  if (!ALLOWED_FOOD_STATUS.includes(status)) {
    throw createHttpError(400, "Status makanan tidak valid.");
  }

  const currentFood = await getFoodByOwner(foodId, userId);

  if (!currentFood) {
    throw createHttpError(404, "Data makanan tidak ditemukan");
  }

  const marketplaceState = await getFoodMarketplaceState(foodId, userId);

  if (PARTIAL_ACTION_STATUS.includes(status)) {
    return handlePartialStockAction({
      foodId,
      userId,
      status,
      quantity,
      currentFood,
      marketplaceState,
    });
  }

  return handleFullStatusChange({
    foodId,
    userId,
    status,
    currentFood,
    marketplaceState,
  });
};

const deleteFoodByUser = async (foodId, userId) => {
  ensureAuthenticated(userId);

  const existingFood = await getFoodByOwner(foodId, userId);

  if (!existingFood) {
    throw createHttpError(404, "Data makanan tidak ditemukan");
  }

  const marketplaceState = await getFoodMarketplaceState(foodId, userId);

  if (Number(marketplaceState.activeTransactions || 0) > 0) {
    throw createHttpError(
      400,
      "Makanan tidak bisa dihapus karena masih ada transaksi COD yang berjalan."
    );
  }

  await cancelActiveMarketplaceByFood(foodId, userId, true);

  await db.query("DELETE FROM foods WHERE id = ? AND user_id = ?", [
    foodId,
    userId,
  ]);

  return true;
};

const getFoodSummaryByUser = async (userId) => {
  ensureAuthenticated(userId);

  const [foods] = await db.query(
    "SELECT * FROM foods WHERE user_id = ? ORDER BY expiry_date ASC",
    [userId]
  );

  const enrichedFoods = await enrichFoodsWithMarketplaceState(foods, userId);
  const summary = await buildSummaryFromFoods(enrichedFoods, userId);

  return summary;
};

module.exports = {
  getFoodsByUser,
  getFoodDetailByUser,
  createFoodByUser,
  updateFoodByUser,
  updateFoodStatusByUser,
  deleteFoodByUser,
  getFoodSummaryByUser,
};