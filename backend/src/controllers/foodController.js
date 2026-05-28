const db = require("../config/db");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const TERMINAL_FOOD_STATUS = [
  "digunakan",
  "dibuang",
  "terjual",
  "kedaluwarsa",
];

const PARTIAL_ACTION_STATUS = ["digunakan", "dibuang"];

const cancelActiveMarketplaceByFood = async (
  foodId,
  userId,
  detachFood = false
) => {
  if (detachFood) {
    await db.query(
      `UPDATE marketplace_products
       SET 
        status = 'dibatalkan',
        quantity = 0,
        stock = 0,
        food_id = NULL
       WHERE food_id = ?
       AND seller_id = ?
       AND status IN ('tersedia', 'dalam_proses')`,
      [foodId, userId]
    );

    return;
  }

  await db.query(
    `UPDATE marketplace_products
     SET 
      status = 'dibatalkan',
      quantity = 0,
      stock = 0
     WHERE food_id = ?
     AND seller_id = ?
     AND status IN ('tersedia', 'dalam_proses')`,
    [foodId, userId]
  );
};

const getFoodMarketplaceState = async (foodId, userId) => {
  const [marketplaceRows] = await db.query(
    `SELECT
      COALESCE(
        SUM(
          CASE 
            WHEN status IN ('tersedia', 'dalam_proses') 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS active_marketplace_quantity,
      COALESCE(
        SUM(
          CASE 
            WHEN status = 'tersedia' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS available_marketplace_quantity,
      COALESCE(
        SUM(
          CASE 
            WHEN status = 'dalam_proses' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS process_marketplace_quantity
     FROM marketplace_products
     WHERE food_id = ?
     AND seller_id = ?`,
    [foodId, userId]
  );

  const [transactionRows] = await db.query(
    `SELECT COUNT(*) AS active_transactions
     FROM transactions t
     JOIN marketplace_products mp ON t.product_id = mp.id
     WHERE mp.food_id = ?
     AND mp.seller_id = ?
     AND t.status = 'waiting_cod'`,
    [foodId, userId]
  );

  return {
    activeMarketplaceQuantity: Number(
      marketplaceRows[0]?.active_marketplace_quantity || 0
    ),
    availableMarketplaceQuantity: Number(
      marketplaceRows[0]?.available_marketplace_quantity || 0
    ),
    processMarketplaceQuantity: Number(
      marketplaceRows[0]?.process_marketplace_quantity || 0
    ),
    activeTransactions: Number(transactionRows[0]?.active_transactions || 0),
  };
};

const mapStatusToCondition = (status) => {
  if (status === "aman") return "layak";
  if (status === "mendekati_kedaluwarsa") return "mendekati_kedaluwarsa";
  if (status === "kedaluwarsa") return "kedaluwarsa";

  return "layak";
};

const calculateFoodStatus = (expiryDate, manualStatus = "") => {
  if (["dijual", "terjual", "digunakan", "dibuang"].includes(manualStatus)) {
    return {
      status: manualStatus,
      priority:
        manualStatus === "dibuang"
          ? "tidak_layak"
          : manualStatus === "digunakan" || manualStatus === "terjual"
            ? "selesai"
            : "sedang",
      condition_status: mapStatusToCondition(manualStatus),
    };
  }

  if (manualStatus === "kedaluwarsa") {
    return {
      status: "kedaluwarsa",
      priority: "tidak_layak",
      condition_status: "kedaluwarsa",
    };
  }

  if (!expiryDate) {
    return {
      status: "aman",
      priority: "rendah",
      condition_status: "layak",
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (Number.isNaN(diffDays)) {
    return {
      status: "aman",
      priority: "rendah",
      condition_status: "layak",
    };
  }

  if (diffDays < 0) {
    return {
      status: "kedaluwarsa",
      priority: "tidak_layak",
      condition_status: "kedaluwarsa",
    };
  }

  if (diffDays <= 3) {
    return {
      status: "mendekati_kedaluwarsa",
      priority: "tinggi",
      condition_status: "mendekati_kedaluwarsa",
    };
  }

  if (diffDays <= 7) {
    return {
      status: "mendekati_kedaluwarsa",
      priority: "sedang",
      condition_status: "mendekati_kedaluwarsa",
    };
  }

  return {
    status: "aman",
    priority: "rendah",
    condition_status: "layak",
  };
};

const mapConditionToStatus = (conditionStatus) => {
  if (conditionStatus === "layak") return "aman";
  if (conditionStatus === "mendekati_kedaluwarsa") {
    return "mendekati_kedaluwarsa";
  }
  if (conditionStatus === "kedaluwarsa") return "kedaluwarsa";

  return "aman";
};

const normalizeFood = (food = {}) => {
  const fallbackStatus =
    food.status || mapConditionToStatus(food.condition_status);

  const calculated = calculateFoodStatus(food.expiry_date, fallbackStatus);

  return {
    id: food.id,
    user_id: food.user_id,
    name: food.name || "",
    category: food.category || "",
    quantity: Number(food.quantity || 0),
    unit: food.unit || "pcs",
    price: Number(food.price || 0),
    storage_location: food.storage_location || "",
    purchase_date: food.purchase_date,
    expiry_date: food.expiry_date,
    condition_status:
      food.condition_status || mapStatusToCondition(calculated.status),
    status: food.status || calculated.status,
    priority: food.priority || calculated.priority,
    note: food.note || food.notes || "",
    notes: food.notes || food.note || "",
    image_url: food.image_url || food.image || "",
    image: food.image || food.image_url || "",
    created_at: food.created_at,
    updated_at: food.updated_at,
  };
};

const buildSummaryFromFoods = (foods = []) => {
  const normalizedFoods = foods.map(normalizeFood);

  return {
    total_foods: normalizedFoods.length,
    total_aman: normalizedFoods.filter((food) => food.status === "aman").length,
    total_mendekati: normalizedFoods.filter(
      (food) => food.status === "mendekati_kedaluwarsa"
    ).length,
    total_kedaluwarsa: normalizedFoods.filter(
      (food) => food.status === "kedaluwarsa"
    ).length,
    total_dibuang: normalizedFoods.filter((food) => food.status === "dibuang")
      .length,
    total_digunakan: normalizedFoods.filter(
      (food) => food.status === "digunakan"
    ).length,
    total_dijual: normalizedFoods.filter((food) => food.status === "dijual")
      .length,
    total_terjual: normalizedFoods.filter((food) => food.status === "terjual")
      .length,
    total_prioritas_tinggi: normalizedFoods.filter(
      (food) => food.priority === "tinggi"
    ).length,
    total_prioritas_sedang: normalizedFoods.filter(
      (food) => food.priority === "sedang"
    ).length,
    total_prioritas_rendah: normalizedFoods.filter(
      (food) => food.priority === "rendah"
    ).length,
  };
};

const validateFoodPayload = ({ name, quantity, unit, price, expiry_date }) => {
  if (!String(name || "").trim()) {
    return "Nama makanan wajib diisi";
  }

  if (!quantity || Number(quantity) <= 0) {
    return "Jumlah makanan harus lebih dari 0";
  }

  if (!String(unit || "").trim()) {
    return "Satuan wajib diisi";
  }

  if (!price || Number(price) <= 0) {
    return "Harga makanan wajib diisi dan harus lebih dari 0";
  }

  if (!expiry_date) {
    return "Tanggal kedaluwarsa wajib diisi";
  }

  const parsedDate = new Date(expiry_date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tanggal kedaluwarsa tidak valid";
  }

  return "";
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

    return res.status(200).json({
      message: "Data makanan berhasil diambil",
      data: foods.map(normalizeFood),
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

    return res.status(200).json({
      message: "Detail makanan berhasil diambil",
      data: normalizeFood(foods[0]),
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

    const allowedStatus = [
      "aman",
      "mendekati_kedaluwarsa",
      "kedaluwarsa",
      "dijual",
      "terjual",
      "digunakan",
      "dibuang",
    ];

    if (!allowedStatus.includes(status)) {
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

    const freeInventoryQuantity = currentQuantity - activeMarketplaceQuantity;

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

      const remainingQuantity = currentQuantity - actionQuantity;
      const remainingFreeQuantity =
        freeInventoryQuantity - actionQuantity > 0
          ? freeInventoryQuantity - actionQuantity
          : 0;

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
          remainingQuantity > 0 ? remainingQuantity : 0,
          finalStatus,
          finalPriority,
          finalConditionStatus,
          id,
          userId,
        ]
      );

      return res.status(200).json({
        message: `Stok makanan berhasil dikurangi karena ${status}.`,
        data: {
          food_id: Number(id),
          action: status,
          action_quantity: actionQuantity,
          previous_quantity: currentQuantity,
          remaining_quantity: remainingQuantity > 0 ? remainingQuantity : 0,
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

    const summary = buildSummaryFromFoods(foods);

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