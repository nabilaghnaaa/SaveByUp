const db = require("../config/db");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
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
  if (conditionStatus === "mendekati_kedaluwarsa") return "mendekati_kedaluwarsa";
  if (conditionStatus === "kedaluwarsa") return "kedaluwarsa";
  return "aman";
};

const mapStatusToCondition = (status) => {
  if (status === "aman") return "layak";
  if (status === "mendekati_kedaluwarsa") return "mendekati_kedaluwarsa";
  if (status === "kedaluwarsa") return "kedaluwarsa";

  return "layak";
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

    if (!name || !quantity || !unit || !expiry_date) {
      return res.status(400).json({
        message:
          "Nama makanan, jumlah, satuan, dan tanggal kedaluwarsa wajib diisi",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Jumlah makanan harus lebih dari 0",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        message: "Harga makanan wajib diisi dan harus lebih dari 0",
      });
    }

    const calculated = calculateFoodStatus(expiry_date, status);
    const finalNote = note || notes || "";
    const finalImage = image_url || image || "";

    await db.query(
      `
      INSERT INTO foods
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        name,
        category || null,
        Number(quantity),
        unit,
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

    if (!name || !quantity || !unit || !expiry_date) {
      return res.status(400).json({
        message:
          "Nama makanan, jumlah, satuan, dan tanggal kedaluwarsa wajib diisi",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Jumlah makanan harus lebih dari 0",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        message: "Harga makanan wajib diisi dan harus lebih dari 0",
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

    const calculated = calculateFoodStatus(expiry_date, status);
    const finalNote = note || notes || "";
    const finalImage = image_url || image || "";

    await db.query(
      `
      UPDATE foods
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
      WHERE id = ? AND user_id = ?
      `,
      [
        name,
        category || null,
        Number(quantity),
        unit,
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
        id,
        userId,
      ]
    );

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
    const { status } = req.body;

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
    const calculated = calculateFoodStatus(currentFood.expiry_date, status);

    await db.query(
      `
      UPDATE foods
      SET
        status = ?,
        priority = ?,
        condition_status = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        calculated.status,
        calculated.priority,
        calculated.condition_status || mapStatusToCondition(calculated.status),
        id,
        userId,
      ]
    );

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