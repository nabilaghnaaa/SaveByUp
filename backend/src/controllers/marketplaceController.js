const db = require("../config/db");

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
    });
  }
};

const sellFoodToMarketplace = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { foodId } = req.params;
    const { price, description } = req.body;

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        message: "Harga produk wajib diisi dan harus lebih dari 0",
      });
    }

    const [foods] = await db.query(
      "SELECT * FROM foods WHERE id = ? AND user_id = ?",
      [foodId, sellerId]
    );

    if (foods.length === 0) {
      return res.status(404).json({
        message: "Data makanan tidak ditemukan",
      });
    }

    const food = foods[0];

    if (food.status === "kedaluwarsa" || food.status === "dibuang") {
      return res.status(400).json({
        message: "Makanan tidak layak ditawarkan ke marketplace",
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
      `INSERT INTO marketplace_products
      (food_id, seller_id, name, category, description, quantity, unit, price, expiry_date, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'tersedia')`,
      [
        food.id,
        sellerId,
        food.name,
        food.category,
        description || food.note || null,
        food.quantity,
        food.unit,
        Number(price),
        food.expiry_date,
        food.image_url || null,
      ]
    );

    await db.query(
      "UPDATE foods SET status = 'dijual', priority = 'rendah' WHERE id = ? AND user_id = ?",
      [foodId, sellerId]
    );

    return res.status(201).json({
      message: "Makanan berhasil ditawarkan ke marketplace",
    });
  } catch (error) {
    console.error("Sell food marketplace error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const deleteMarketplaceProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    const [products] = await db.query(
      "SELECT * FROM marketplace_products WHERE id = ? AND seller_id = ?",
      [id, sellerId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Produk marketplace tidak ditemukan",
      });
    }

    await db.query(
      "DELETE FROM marketplace_products WHERE id = ? AND seller_id = ?",
      [id, sellerId]
    );

    await db.query(
      "UPDATE foods SET status = 'aman' WHERE id = ? AND user_id = ?",
      [products[0].food_id, sellerId]
    );

    return res.status(200).json({
      message: "Produk marketplace berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete marketplace product error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  getMarketplaceProducts,
  getMarketplaceProductById,
  sellFoodToMarketplace,
  deleteMarketplaceProduct,
};