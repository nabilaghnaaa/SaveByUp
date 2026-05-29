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
} = require("../services/foodMarketplace.service");

const { createStockLog } = require("../services/foodStockLog.service");
const { buildSummaryFromFoods } = require("../services/foodSummary.service");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const getFoods = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [foods] = await db.query(
      "SELECT * FROM foods WHERE user_id = ? ORDER BY expiry_date ASC",
      [userId]
    );

    const enrichedFoods = await enrichFoodsWithMarketplaceState(foods, userId);

    return res.status(200).json({
      message: "Data makanan berhasil diambil",
      data: enrichedFoods.map(normalizeFood),
    });
  } catch (error) {
    console.error("Get foods error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const getFoodById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [foods] = await db.query(
      "SELECT * FROM foods WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (foods.length === 0) {
      return res.status(404).json({
        message: "Data makanan tidak ditemukan",
      });
    }

    const enrichedFood = await enrichFoodWithMarketplaceState(foods[0], userId);

    return res.status(200).json({
      message: "Detail makanan berhasil diambil",
      data: normalizeFood(enrichedFood),
    });
  } catch (error) {
    console.error("Get food by id error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const createFood = async (req, res) => {
  try {
    const userId = getUserId(req);

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
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const validationMessage = validateFoodPayload({
      name,
      quantity,
      unit,
      price,
      expiry_date,
    });

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      });
    }

    const calculated = calculateFoodStatus(expiry_date, status);
    const finalNote = note || notes || "";
    const finalImage = image_url || image || "";

    await db.query(
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
        String(name || "").trim(),
        category || null,
        Number(quantity),
        unit || "pcs",
        Number(price),
        storage_location || null,
        purchase_date || null,
        expiry_date,
        calculated.condition_status || mapStatusToCondition(calculated.status),
        calculated.status,
        calculated.priority,
        finalNote,
        finalImage,
        finalNote,
        finalImage,
      ]
    );

    return res.status(201).json({
      message: "Data makanan berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Create food error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

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
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const validationMessage = validateFoodPayload({
      name,
      quantity,
      unit,
      price,
      expiry_date,
    });

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      });
    }

    const [existingFood] = await db.query(
      "SELECT * FROM foods WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingFood.length === 0) {
      return res.status(404).json({
        message: "Data makanan tidak ditemukan",
      });
    }

    const marketplaceState = await getFoodMarketplaceState(id, userId);
    const calculated = calculateFoodStatus(expiry_date, status);

    if (
      TERMINAL_FOOD_STATUS.includes(calculated.status) &&
      marketplaceState.activeTransactions > 0
    ) {
      return res.status(400).json({
        message:
          "Makanan tidak bisa diubah menjadi digunakan/dibuang/terjual/kedaluwarsa karena masih ada transaksi COD yang berjalan.",
      });
    }

    if (
      marketplaceState.activeMarketplaceQuantity > 0 &&
      Number(quantity) < marketplaceState.activeMarketplaceQuantity
    ) {
      return res.status(400).json({
        message: `Jumlah stok inventaris tidak boleh lebih kecil dari stok yang sedang aktif di marketplace. Stok aktif marketplace saat ini: ${marketplaceState.activeMarketplaceQuantity}.`,
      });
    }

    const shouldKeepSoldStatus =
      marketplaceState.activeMarketplaceQuantity > 0 &&
      !TERMINAL_FOOD_STATUS.includes(calculated.status);

    const finalStatus = shouldKeepSoldStatus ? "dijual" : calculated.status;
    const finalPriority = shouldKeepSoldStatus ? "sedang" : calculated.priority;
    const finalConditionStatus =
      calculated.condition_status || mapStatusToCondition(calculated.status);

    const finalNote = note || notes || "";
    const finalImage = image_url || image || "";

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
        String(name || "").trim(),
        category || null,
        Number(quantity),
        unit || "pcs",
        Number(price),
        storage_location || null,
        purchase_date || null,
        expiry_date,
        finalConditionStatus,
        finalStatus,
        finalPriority,
        finalNote,
        finalImage,
        finalNote,
        finalImage,
        id,
        userId,
      ]
    );

    if (TERMINAL_FOOD_STATUS.includes(calculated.status)) {
      await cancelActiveMarketplaceByFood(id, userId);
    }

    return res.status(200).json({
      message: "Data makanan berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update food error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updateFoodStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { status, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status makanan wajib diisi.",
      });
    }

    if (!ALLOWED_FOOD_STATUS.includes(status)) {
      return res.status(400).json({
        message: "Status makanan tidak valid.",
      });
    }

    const [existingFood] = await db.query(
      "SELECT * FROM foods WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingFood.length === 0) {
      return res.status(404).json({
        message: "Data makanan tidak ditemukan",
      });
    }

    const currentFood = existingFood[0];
    const marketplaceState = await getFoodMarketplaceState(id, userId);

    const currentQuantity = Number(currentFood.quantity || 0);
    const activeMarketplaceQuantity = Number(
      marketplaceState.activeMarketplaceQuantity || 0
    );

    const freeInventoryQuantity = Math.max(
      currentQuantity - activeMarketplaceQuantity,
      0
    );

    if (PARTIAL_ACTION_STATUS.includes(status)) {
      if (!quantity || Number(quantity) <= 0) {
        return res.status(400).json({
          message: `Jumlah makanan yang ${status} wajib diisi dan harus lebih dari 0.`,
        });
      }

      const actionQuantity = Number(quantity);

      if (freeInventoryQuantity <= 0) {
        return res.status(400).json({
          message:
            "Tidak ada stok bebas yang bisa digunakan/dibuang karena semua stok sedang aktif di marketplace.",
        });
      }

      if (actionQuantity > freeInventoryQuantity) {
        return res.status(400).json({
          message: `Jumlah yang ${status} melebihi stok bebas. Stok bebas yang bisa ${status}: ${freeInventoryQuantity} ${
            currentFood.unit || "pcs"
          }.`,
        });
      }

      const remainingQuantity = Math.max(currentQuantity - actionQuantity, 0);
      const remainingFreeQuantity = Math.max(
        freeInventoryQuantity - actionQuantity,
        0
      );

      let finalStatus = currentFood.status;
      let finalPriority = currentFood.priority || "rendah";
      let finalConditionStatus = currentFood.condition_status || "layak";

      if (remainingQuantity <= 0) {
        finalStatus = status;
        finalPriority = status === "dibuang" ? "tidak_layak" : "selesai";
        finalConditionStatus = mapStatusToCondition(finalStatus);
      } else if (activeMarketplaceQuantity > 0) {
        finalStatus = "dijual";
        finalPriority = "sedang";
        finalConditionStatus = mapStatusToCondition(finalStatus);
      } else {
        const recalculated = calculateFoodStatus(currentFood.expiry_date, "");
        finalStatus = recalculated.status;
        finalPriority = recalculated.priority;
        finalConditionStatus =
          recalculated.condition_status || mapStatusToCondition(finalStatus);
      }

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
          finalStatus,
          finalPriority,
          finalConditionStatus,
          id,
          userId,
        ]
      );

      await createStockLog({
        foodId: id,
        userId,
        action: status,
        quantity: actionQuantity,
        note: `${actionQuantity} ${currentFood.unit || "pcs"} ${currentFood.name} ${status}`,
      });

      return res.status(200).json({
        message: `Stok makanan berhasil dikurangi karena ${status}.`,
        data: {
          food_id: Number(id),
          action: status,
          action_quantity: actionQuantity,
          previous_quantity: currentQuantity,
          remaining_quantity: remainingQuantity,
          active_marketplace_quantity: activeMarketplaceQuantity,
          free_inventory_quantity_before: freeInventoryQuantity,
          free_inventory_quantity_after: remainingFreeQuantity,
          final_status: finalStatus,
        },
      });
    }

    if (
      TERMINAL_FOOD_STATUS.includes(status) &&
      marketplaceState.activeTransactions > 0
    ) {
      return res.status(400).json({
        message:
          "Status makanan tidak bisa diubah karena masih ada transaksi COD yang berjalan.",
      });
    }

    if (
      status !== "dijual" &&
      !TERMINAL_FOOD_STATUS.includes(status) &&
      marketplaceState.activeMarketplaceQuantity > 0
    ) {
      return res.status(400).json({
        message:
          "Status makanan tidak bisa diubah menjadi aman/mendekati kedaluwarsa karena makanan masih aktif di marketplace. Batalkan produk marketplace terlebih dahulu.",
      });
    }

    if (status === "dijual" && marketplaceState.activeMarketplaceQuantity <= 0) {
      return res.status(400).json({
        message:
          "Status makanan tidak bisa diubah manual menjadi dijual karena belum ada produk aktif di marketplace.",
      });
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
        id,
        userId,
      ]
    );

    if (TERMINAL_FOOD_STATUS.includes(calculated.status)) {
      await cancelActiveMarketplaceByFood(id, userId);
    }

    return res.status(200).json({
      message: "Status makanan berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update food status error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [existingFood] = await db.query(
      "SELECT * FROM foods WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingFood.length === 0) {
      return res.status(404).json({
        message: "Data makanan tidak ditemukan",
      });
    }

    const marketplaceState = await getFoodMarketplaceState(id, userId);

    if (marketplaceState.activeTransactions > 0) {
      return res.status(400).json({
        message:
          "Makanan tidak bisa dihapus karena masih ada transaksi COD yang berjalan.",
      });
    }

    await cancelActiveMarketplaceByFood(id, userId, true);

    await db.query("DELETE FROM foods WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    return res.status(200).json({
      message: "Data makanan berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete food error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const getFoodSummary = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [foods] = await db.query(
      "SELECT * FROM foods WHERE user_id = ? ORDER BY expiry_date ASC",
      [userId]
    );

    const summary = await buildSummaryFromFoods(foods, userId);

    return res.status(200).json({
      message: "Ringkasan makanan berhasil diambil",
      data: summary,
    });
  } catch (error) {
    console.error("Get food summary error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
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