const db = require("../config/db");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const getProfileCompleteness = (user = {}) => {
  const missingFields = [];

  if (!String(user.name || "").trim()) {
    missingFields.push("name");
  }

  if (!String(user.email || "").trim()) {
    missingFields.push("email");
  }

  if (!String(user.whatsapp || "").trim()) {
    missingFields.push("whatsapp");
  }

  if (!String(user.address || "").trim()) {
    missingFields.push("address");
  }

  return {
    isProfileComplete: missingFields.length === 0,
    missingFields,
  };
};

const getMarketplaceProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT 
        mp.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.whatsapp AS seller_whatsapp,
        u.address AS seller_address,
        u.rating AS seller_rating
       FROM marketplace_products mp
       JOIN users u ON mp.seller_id = u.id
       WHERE mp.status IN ('tersedia', 'dalam_proses')
       ORDER BY mp.created_at DESC`
    );

    return res.status(200).json({
      message: "Produk marketplace berhasil diambil",
      data: products,
    });
  } catch (error) {
    console.error("Get marketplace products error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const getMarketplaceProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      `SELECT 
        mp.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.whatsapp AS seller_whatsapp,
        u.address AS seller_address,
        u.rating AS seller_rating
       FROM marketplace_products mp
       JOIN users u ON mp.seller_id = u.id
       WHERE mp.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Produk marketplace tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Detail produk berhasil diambil",
      data: products[0],
    });
  } catch (error) {
    console.error("Get marketplace detail error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const sellFoodToMarketplace = async (req, res) => {
  try {
    const sellerId = getUserId(req);
    const { foodId } = req.params;
    const { quantity, price, description } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [sellers] = await db.query(
      `SELECT id, name, email, whatsapp, address
       FROM users
       WHERE id = ?`,
      [sellerId]
    );

    if (sellers.length === 0) {
      return res.status(404).json({
        message: "Data penjual tidak ditemukan.",
      });
    }

    const seller = sellers[0];
    const profileCheck = getProfileCompleteness(seller);

    if (!profileCheck.isProfileComplete) {
      return res.status(400).json({
        message:
          "Lengkapi profil terlebih dahulu sebelum menjual produk. Nama, email, WhatsApp, dan alamat wajib diisi.",
        code: "PROFILE_INCOMPLETE",
        missing_fields: profileCheck.missingFields,
      });
    }

    if (!foodId) {
      return res.status(400).json({
        message: "ID makanan tidak ditemukan.",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Jumlah yang dijual wajib diisi dan harus lebih dari 0",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        message: "Harga produk wajib diisi dan harus lebih dari 0",
      });
    }

    const sellQuantity = Number(quantity);
    const sellPrice = Number(price);

    const [foods] = await db.query(
      "SELECT * FROM foods WHERE id = ? AND user_id = ?",
      [foodId, sellerId]
    );

    if (foods.length === 0) {
      return res.status(404).json({
        message: "Data makanan tidak ditemukan atau bukan milik kamu.",
      });
    }

    const food = foods[0];

    if (Number(food.quantity) <= 0) {
      return res.status(400).json({
        message: "Stok makanan sudah habis",
      });
    }

    if (sellQuantity > Number(food.quantity)) {
      return res.status(400).json({
        message: "Jumlah yang dijual tidak boleh melebihi stok inventaris",
      });
    }

    if (food.status === "kedaluwarsa" || food.status === "dibuang") {
      return res.status(400).json({
        message: "Makanan tidak layak ditawarkan ke marketplace",
      });
    }

    if (food.status === "terjual" || food.status === "digunakan") {
      return res.status(400).json({
        message: "Makanan yang sudah selesai tidak bisa ditawarkan ke marketplace",
      });
    }

    const [existingProducts] = await db.query(
      "SELECT id FROM marketplace_products WHERE food_id = ? AND status IN ('tersedia', 'dalam_proses')",
      [foodId]
    );

    if (existingProducts.length > 0) {
      return res.status(409).json({
        message: "Makanan ini sudah ditawarkan di marketplace",
      });
    }

    await db.query(
      `
      INSERT INTO marketplace_products
      (
        food_id,
        seller_id,
        name,
        category,
        description,
        quantity,
        price,
        stock,
        unit,
        expiry_date,
        image_url,
        image,
        location,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        food.id,
        sellerId,
        food.name,
        food.category || null,
        description || food.note || food.notes || null,
        sellQuantity,
        sellPrice,
        sellQuantity,
        food.unit || "pcs",
        food.expiry_date,
        food.image_url || food.image || null,
        food.image || food.image_url || null,
        food.storage_location || seller.address || null,
        "tersedia",
      ]
    );

    await db.query(
      "UPDATE foods SET status = 'dijual', priority = 'sedang' WHERE id = ? AND user_id = ?",
      [foodId, sellerId]
    );

    return res.status(201).json({
      message: "Makanan berhasil ditawarkan ke marketplace",
    });
  } catch (error) {
    console.error("Sell food marketplace error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const deleteMarketplaceProduct = async (req, res) => {
  try {
    const sellerId = getUserId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [products] = await db.query(
      "SELECT * FROM marketplace_products WHERE id = ? AND seller_id = ?",
      [id, sellerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Produk marketplace tidak ditemukan atau bukan milik kamu",
      });
    }

    const product = products[0];

    if (product.status === "dalam_proses") {
      return res.status(400).json({
        message:
          "Produk tidak bisa dihapus karena sedang dalam proses transaksi. Selesaikan atau batalkan transaksi terlebih dahulu.",
      });
    }

    await db.query(
      "DELETE FROM marketplace_products WHERE id = ? AND seller_id = ?",
      [id, sellerId]
    );

    const [activeProducts] = await db.query(
      "SELECT id FROM marketplace_products WHERE food_id = ? AND status IN ('tersedia', 'dalam_proses')",
      [product.food_id]
    );

    if (activeProducts.length === 0) {
      await db.query(
        "UPDATE foods SET status = 'aman', priority = 'rendah' WHERE id = ? AND user_id = ? AND status = 'dijual'",
        [product.food_id, sellerId]
      );
    }

    return res.status(200).json({
      message: "Produk marketplace berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete marketplace product error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  getMarketplaceProducts,
  getMarketplaceProductById,
  sellFoodToMarketplace,
  deleteMarketplaceProduct,
};