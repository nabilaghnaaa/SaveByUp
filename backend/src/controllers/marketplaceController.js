const db = require("../config/db");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const getProfileCompleteness = (user = {}) => {
  const missingFields = [];

  if (!String(user.name || "").trim()) missingFields.push("name");
  if (!String(user.email || "").trim()) missingFields.push("email");
  if (!String(user.whatsapp || "").trim()) missingFields.push("whatsapp");
  if (!String(user.address || "").trim()) missingFields.push("address");

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
       WHERE 
        (mp.status = 'tersedia' AND mp.quantity > 0)
        OR mp.status = 'dalam_proses'
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

    if (
      ["kedaluwarsa", "dibuang", "terjual", "digunakan"].includes(food.status)
    ) {
      return res.status(400).json({
        message: "Makanan ini tidak bisa ditawarkan ke marketplace",
      });
    }

    const [activeMarketplaceRows] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_marketplace_quantity
       FROM marketplace_products
       WHERE food_id = ?
       AND seller_id = ?
       AND status IN ('tersedia', 'dalam_proses')`,
      [foodId, sellerId]
    );

    const totalMarketplaceQuantity = Number(
      activeMarketplaceRows[0]?.total_marketplace_quantity || 0
    );

    const availableToSell = Number(food.quantity) - totalMarketplaceQuantity;

    if (availableToSell <= 0) {
      return res.status(400).json({
        message:
          "Seluruh stok makanan ini sudah sedang ditawarkan di marketplace.",
      });
    }

    if (sellQuantity > availableToSell) {
      return res.status(400).json({
        message: `Jumlah yang dijual melebihi stok yang masih bisa ditawarkan. Sisa stok yang bisa dijual: ${availableToSell} ${
          food.unit || "pcs"
        }.`,
      });
    }

    const [existingAvailableProducts] = await db.query(
      `SELECT *
       FROM marketplace_products
       WHERE food_id = ?
       AND seller_id = ?
       AND status = 'tersedia'
       ORDER BY id ASC
       LIMIT 1`,
      [foodId, sellerId]
    );

    if (existingAvailableProducts.length > 0) {
      const existingProduct = existingAvailableProducts[0];
      const newQuantity = Number(existingProduct.quantity || 0) + sellQuantity;

      await db.query(
        `UPDATE marketplace_products
         SET
          quantity = ?,
          stock = ?,
          price = ?,
          description = ?,
          unit = ?,
          expiry_date = ?,
          image_url = ?,
          image = ?,
          location = ?,
          status = 'tersedia'
         WHERE id = ? AND seller_id = ?`,
        [
          newQuantity,
          newQuantity,
          sellPrice,
          description ||
            food.note ||
            food.notes ||
            existingProduct.description ||
            null,
          food.unit || "pcs",
          food.expiry_date,
          food.image_url || food.image || existingProduct.image_url || null,
          food.image || food.image_url || existingProduct.image || null,
          food.storage_location || seller.address || existingProduct.location || null,
          existingProduct.id,
          sellerId,
        ]
      );

      await db.query(
        "UPDATE foods SET status = 'dijual', priority = 'sedang' WHERE id = ? AND user_id = ?",
        [foodId, sellerId]
      );

      return res.status(200).json({
        message: "Stok produk marketplace berhasil ditambahkan",
        data: {
          food_id: Number(foodId),
          marketplace_product_id: existingProduct.id,
          quantity_added: sellQuantity,
          marketplace_quantity: newQuantity,
          remaining_available_to_sell: availableToSell - sellQuantity,
        },
      });
    }

    const [insertResult] = await db.query(
      `INSERT INTO marketplace_products
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      data: {
        food_id: Number(foodId),
        marketplace_product_id: insertResult.insertId,
        quantity_added: sellQuantity,
        marketplace_quantity: sellQuantity,
        remaining_available_to_sell: availableToSell - sellQuantity,
      },
    });
  } catch (error) {
    console.error("Sell food marketplace error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updateMarketplaceProduct = async (req, res) => {
  try {
    const sellerId = getUserId(req);
    const { id } = req.params;
    const { quantity, price, description } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Jumlah produk wajib diisi dan harus lebih dari 0",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        message: "Harga produk wajib diisi dan harus lebih dari 0",
      });
    }

    const [products] = await db.query(
      `SELECT 
        mp.*, 
        f.quantity AS food_quantity,
        f.unit AS food_unit
       FROM marketplace_products mp
       JOIN foods f ON mp.food_id = f.id
       WHERE mp.id = ? AND mp.seller_id = ?`,
      [id, sellerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Produk marketplace tidak ditemukan atau bukan milik kamu",
      });
    }

    const product = products[0];

    if (product.status !== "tersedia") {
      return res.status(400).json({
        message: "Produk yang tidak tersedia tidak bisa diedit",
      });
    }

    const [pendingRequests] = await db.query(
      `SELECT id FROM purchase_requests
       WHERE product_id = ?
       AND status = 'pending'
       LIMIT 1`,
      [id]
    );

    if (pendingRequests.length > 0) {
      return res.status(400).json({
        message:
          "Produk tidak bisa diedit karena masih ada pengajuan pembelian yang menunggu. Tolak atau proses pengajuan terlebih dahulu.",
      });
    }

    const [otherRows] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS other_quantity
       FROM marketplace_products
       WHERE food_id = ?
       AND seller_id = ?
       AND id <> ?
       AND status IN ('tersedia', 'dalam_proses')`,
      [product.food_id, sellerId, id]
    );

    const otherQuantity = Number(otherRows[0]?.other_quantity || 0);
    const maxAllowedQuantity = Number(product.food_quantity || 0) - otherQuantity;

    if (maxAllowedQuantity <= 0) {
      return res.status(400).json({
        message: "Tidak ada stok inventaris yang masih bisa ditawarkan.",
      });
    }

    if (Number(quantity) > maxAllowedQuantity) {
      return res.status(400).json({
        message: `Jumlah produk melebihi stok yang masih bisa ditawarkan. Maksimal: ${maxAllowedQuantity} ${
          product.food_unit || "pcs"
        }.`,
      });
    }

    await db.query(
      `UPDATE marketplace_products
       SET quantity = ?, stock = ?, price = ?, description = ?
       WHERE id = ? AND seller_id = ?`,
      [
        Number(quantity),
        Number(quantity),
        Number(price),
        description || null,
        id,
        sellerId,
      ]
    );

    return res.status(200).json({
      message: "Produk marketplace berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update marketplace product error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const cancelMarketplaceProduct = async (req, res) => {
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
          "Produk tidak bisa dibatalkan karena sedang dalam proses transaksi COD.",
      });
    }

    if (product.status !== "tersedia") {
      return res.status(400).json({
        message: "Produk ini sudah tidak aktif di marketplace",
      });
    }

    await db.query(
      `UPDATE marketplace_products
       SET status = 'dibatalkan',
           quantity = 0,
           stock = 0
       WHERE id = ? AND seller_id = ?`,
      [id, sellerId]
    );

    await db.query(
      `UPDATE purchase_requests
       SET status = 'cancelled', updated_at = NOW()
       WHERE product_id = ?
       AND status = 'pending'`,
      [id]
    );

    const [activeProducts] = await db.query(
      `SELECT id FROM marketplace_products
       WHERE food_id = ?
       AND seller_id = ?
       AND status IN ('tersedia', 'dalam_proses')`,
      [product.food_id, sellerId]
    );

    if (activeProducts.length === 0) {
      await db.query(
        "UPDATE foods SET status = 'aman', priority = 'rendah' WHERE id = ? AND user_id = ? AND status = 'dijual'",
        [product.food_id, sellerId]
      );
    }

    return res.status(200).json({
      message: "Produk berhasil dibatalkan dari marketplace",
    });
  } catch (error) {
    console.error("Cancel marketplace product error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const deleteMarketplaceProduct = async (req, res) => {
  return cancelMarketplaceProduct(req, res);
};

module.exports = {
  getMarketplaceProducts,
  getMarketplaceProductById,
  sellFoodToMarketplace,
  updateMarketplaceProduct,
  cancelMarketplaceProduct,
  deleteMarketplaceProduct,
};