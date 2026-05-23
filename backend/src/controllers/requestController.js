const db = require("../config/db");

const createNotification = async (userId, title, message, type = "system") => {
  await db.query(
    "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
    [userId, title, message, type]
  );
};

const createPurchaseRequest = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId } = req.params;
    const { quantity, offer_price, note } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Jumlah pembelian wajib diisi",
      });
    }

    if (!offer_price || Number(offer_price) <= 0) {
      return res.status(400).json({
        message: "Harga penawaran wajib diisi",
      });
    }

    const [products] = await db.query(
      "SELECT * FROM marketplace_products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Produk marketplace tidak ditemukan",
      });
    }

    const product = products[0];

    if (product.status !== "tersedia") {
      return res.status(400).json({
        message: "Produk tidak tersedia untuk diajukan",
      });
    }

    if (product.seller_id === buyerId) {
      return res.status(400).json({
        message: "Kamu tidak bisa membeli produk milik sendiri",
      });
    }

    if (Number(quantity) > Number(product.quantity)) {
      return res.status(400).json({
        message: "Jumlah pembelian melebihi stok tersedia",
      });
    }

    const [existingRequests] = await db.query(
      `SELECT id FROM purchase_requests 
       WHERE product_id = ? AND buyer_id = ? AND status = 'menunggu'`,
      [productId, buyerId]
    );

    if (existingRequests.length > 0) {
      return res.status(409).json({
        message: "Kamu sudah mengajukan pembelian untuk produk ini",
      });
    }

    await db.query(
      `INSERT INTO purchase_requests
      (product_id, buyer_id, seller_id, quantity, offer_price, note, status)
      VALUES (?, ?, ?, ?, ?, ?, 'menunggu')`,
      [
        productId,
        buyerId,
        product.seller_id,
        Number(quantity),
        Number(offer_price),
        note || null,
      ]
    );

    await createNotification(
      product.seller_id,
      "Pengajuan pembelian baru",
      `Ada pengajuan pembelian untuk produk ${product.name}.`,
      "request"
    );

    return res.status(201).json({
      message: "Pengajuan pembelian berhasil dikirim",
    });
  } catch (error) {
    console.error("Create purchase request error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const [requests] = await db.query(
      `SELECT 
        pr.*,
        mp.name AS product_name,
        mp.image_url AS product_image,
        u.name AS buyer_name,
        u.email AS buyer_email,
        u.whatsapp AS buyer_whatsapp
       FROM purchase_requests pr
       JOIN marketplace_products mp ON pr.product_id = mp.id
       JOIN users u ON pr.buyer_id = u.id
       WHERE pr.seller_id = ?
       ORDER BY pr.created_at DESC`,
      [sellerId]
    );

    return res.status(200).json({
      message: "Pengajuan masuk berhasil diambil",
      data: requests,
    });
  } catch (error) {
    console.error("Get incoming requests error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [requests] = await db.query(
      `SELECT 
        pr.*,
        mp.name AS product_name,
        mp.image_url AS product_image,
        u.name AS seller_name,
        u.whatsapp AS seller_whatsapp
       FROM purchase_requests pr
       JOIN marketplace_products mp ON pr.product_id = mp.id
       JOIN users u ON pr.seller_id = u.id
       WHERE pr.buyer_id = ?
       ORDER BY pr.created_at DESC`,
      [buyerId]
    );

    return res.status(200).json({
      message: "Pengajuan saya berhasil diambil",
      data: requests,
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    const [requests] = await db.query(
      `SELECT pr.*, mp.name AS product_name, mp.food_id
       FROM purchase_requests pr
       JOIN marketplace_products mp ON pr.product_id = mp.id
       WHERE pr.id = ? AND pr.seller_id = ?`,
      [id, sellerId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Pengajuan tidak ditemukan",
      });
    }

    const request = requests[0];

    if (request.status !== "menunggu") {
      return res.status(400).json({
        message: "Pengajuan ini sudah diproses",
      });
    }

    await db.query(
      "UPDATE purchase_requests SET status = 'disetujui', responded_at = NOW() WHERE id = ?",
      [id]
    );

    await db.query(
      "UPDATE marketplace_products SET status = 'dalam_proses' WHERE id = ?",
      [request.product_id]
    );

    await db.query(
      `INSERT INTO transactions
      (request_id, product_id, buyer_id, seller_id, quantity, final_price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'menunggu_komunikasi')`,
      [
        request.id,
        request.product_id,
        request.buyer_id,
        request.seller_id,
        request.quantity,
        request.offer_price,
      ]
    );

    await createNotification(
      request.buyer_id,
      "Pengajuan disetujui",
      `Pengajuan kamu untuk produk ${request.product_name} disetujui. Silakan hubungi penjual via WhatsApp.`,
      "request"
    );

    return res.status(200).json({
      message: "Pengajuan berhasil disetujui",
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    const [requests] = await db.query(
      `SELECT pr.*, mp.name AS product_name
       FROM purchase_requests pr
       JOIN marketplace_products mp ON pr.product_id = mp.id
       WHERE pr.id = ? AND pr.seller_id = ?`,
      [id, sellerId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Pengajuan tidak ditemukan",
      });
    }

    const request = requests[0];

    if (request.status !== "menunggu") {
      return res.status(400).json({
        message: "Pengajuan ini sudah diproses",
      });
    }

    await db.query(
      "UPDATE purchase_requests SET status = 'ditolak', responded_at = NOW() WHERE id = ?",
      [id]
    );

    await createNotification(
      request.buyer_id,
      "Pengajuan ditolak",
      `Pengajuan kamu untuk produk ${request.product_name} ditolak oleh penjual.`,
      "request"
    );

    return res.status(200).json({
      message: "Pengajuan berhasil ditolak",
    });
  } catch (error) {
    console.error("Reject request error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  createPurchaseRequest,
  getIncomingRequests,
  getMyRequests,
  approveRequest,
  rejectRequest,
};