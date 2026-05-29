const db = require("../config/db");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const createNotification = async (userId, title, message, type = "system") => {
  try {
    await db.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [userId, title, message, type]
    );
  } catch (error) {
    console.error("Create notification error:", error.message);
  }
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

const createPurchaseRequest = async (req, res) => {
  try {
    const buyerId = getUserId(req);
    const { productId } = req.params;
    const { quantity, offer_price, note } = req.body;

    if (!buyerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [buyers] = await db.query(
      `SELECT id, name, email, whatsapp, address, latitude, longitude
       FROM users
       WHERE id = ?`,
      [buyerId]
    );

    if (buyers.length === 0) {
      return res.status(404).json({
        message: "Data pembeli tidak ditemukan.",
      });
    }

    const profileCheck = getProfileCompleteness(buyers[0]);

    if (!profileCheck.isProfileComplete) {
      return res.status(400).json({
        message:
          "Lengkapi profil terlebih dahulu sebelum mengajukan pembelian. Nama, email, WhatsApp, dan alamat wajib diisi.",
        code: "PROFILE_INCOMPLETE",
        missing_fields: profileCheck.missingFields,
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Jumlah pembelian wajib diisi dan harus lebih dari 0",
      });
    }

    if (!offer_price || Number(offer_price) <= 0) {
      return res.status(400).json({
        message: "Harga penawaran wajib diisi dan harus lebih dari 0",
      });
    }

    const buyQuantity = Number(quantity);
    const offerPrice = Number(offer_price);

    const [products] = await db.query(
      `SELECT 
        mp.*,
        u.name AS seller_name,
        u.whatsapp AS seller_whatsapp,
        u.address AS seller_address
       FROM marketplace_products mp
       JOIN users u ON mp.seller_id = u.id
       WHERE mp.id = ?`,
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

    if (Number(product.seller_id) === Number(buyerId)) {
      return res.status(400).json({
        message: "Kamu tidak bisa membeli produk milik sendiri",
        code: "BUY_OWN_PRODUCT",
      });
    }

    if (Number(product.quantity) <= 0) {
      return res.status(400).json({
        message: "Stok produk sudah habis",
      });
    }

    if (buyQuantity > Number(product.quantity)) {
      return res.status(400).json({
        message: "Jumlah pembelian melebihi stok tersedia",
      });
    }

    const [existingRequests] = await db.query(
      `SELECT id FROM purchase_requests 
       WHERE product_id = ? 
       AND buyer_id = ? 
       AND status IN ('pending', 'accepted')
       LIMIT 1`,
      [productId, buyerId]
    );

    if (existingRequests.length > 0) {
      return res.status(409).json({
        message:
          "Kamu sudah memiliki pengajuan aktif untuk produk ini. Tunggu penjual memproses pengajuan sebelumnya.",
      });
    }

    await db.query(
      `INSERT INTO purchase_requests
      (
        product_id, 
        buyer_id, 
        seller_id, 
        quantity, 
        original_price,
        offer_price, 
        is_negotiated,
        note, 
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        buyerId,
        product.seller_id,
        buyQuantity,
        Number(product.price),
        offerPrice,
        offerPrice !== Number(product.price) ? 1 : 0,
        note || null,
        "pending",
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
      error: error.message,
    });
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    const sellerId = getUserId(req);

    if (!sellerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [requests] = await db.query(
      `SELECT 
        pr.*,
        mp.name AS product_name,
        mp.image_url AS product_image,
        mp.quantity AS product_available_quantity,
        mp.status AS product_status,
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
      error: error.message,
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const buyerId = getUserId(req);

    if (!buyerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [requests] = await db.query(
      `SELECT 
        pr.*,
        mp.name AS product_name,
        mp.image_url AS product_image,
        mp.quantity AS product_available_quantity,
        mp.status AS product_status,
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
      error: error.message,
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    const sellerId = getUserId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [requests] = await db.query(
      `SELECT 
        pr.*, 
        mp.name AS product_name, 
        mp.food_id,
        mp.quantity AS marketplace_quantity,
        mp.status AS marketplace_status,
        buyer.latitude AS buyer_latitude,
        buyer.longitude AS buyer_longitude,
        seller.latitude AS seller_latitude,
        seller.longitude AS seller_longitude,
        seller.location_label AS seller_location_label
       FROM purchase_requests pr
       JOIN marketplace_products mp ON pr.product_id = mp.id
       JOIN users buyer ON pr.buyer_id = buyer.id
       JOIN users seller ON pr.seller_id = seller.id
       WHERE pr.id = ? AND pr.seller_id = ?`,
      [id, sellerId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Pengajuan tidak ditemukan atau bukan milik produk kamu",
      });
    }

    const request = requests[0];

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Pengajuan ini sudah diproses",
      });
    }

    if (request.marketplace_status !== "tersedia") {
      return res.status(400).json({
        message: "Produk sedang tidak tersedia untuk diproses",
      });
    }

    const requestQuantity = Number(request.quantity);
    const currentMarketplaceQuantity = Number(request.marketplace_quantity || 0);

    if (requestQuantity <= 0) {
      return res.status(400).json({
        message: "Jumlah pengajuan tidak valid",
      });
    }

    if (requestQuantity > currentMarketplaceQuantity) {
      return res.status(400).json({
        message: "Jumlah pengajuan melebihi stok marketplace saat ini",
      });
    }

    const finalPrice = Number(request.offer_price);
    const totalPrice = finalPrice * requestQuantity;
    const remainingMarketplaceQuantity =
      currentMarketplaceQuantity - requestQuantity;

    await db.query(
      "UPDATE purchase_requests SET status = 'accepted', updated_at = NOW() WHERE id = ?",
      [id]
    );

    await db.query(
      `UPDATE marketplace_products
       SET quantity = ?, stock = ?, status = ?
       WHERE id = ?`,
      [
        remainingMarketplaceQuantity > 0 ? remainingMarketplaceQuantity : 0,
        remainingMarketplaceQuantity > 0 ? remainingMarketplaceQuantity : 0,
        remainingMarketplaceQuantity > 0 ? "tersedia" : "dalam_proses",
        request.product_id,
      ]
    );

    await db.query(
      `UPDATE purchase_requests
       SET status = 'rejected', updated_at = NOW()
       WHERE product_id = ?
       AND id <> ?
       AND status = 'pending'
       AND quantity > ?`,
      [request.product_id, id, remainingMarketplaceQuantity]
    );

    await db.query(
      `INSERT INTO transactions
      (
        purchase_request_id,
        product_id, 
        buyer_id, 
        seller_id, 
        final_price, 
        quantity, 
        total_price, 
        cod_location,
        cod_time,
        buyer_latitude,
        buyer_longitude,
        seller_latitude,
        seller_longitude,
        seller_location_label,
        location_revealed,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request.id,
        request.product_id,
        request.buyer_id,
        request.seller_id,
        finalPrice,
        requestQuantity,
        totalPrice,
        request.cod_location || null,
        request.cod_time || null,
        request.buyer_latitude || null,
        request.buyer_longitude || null,
        request.seller_latitude || null,
        request.seller_longitude || null,
        request.seller_location_label || null,
        0,
        "waiting_buyer_confirmation",
      ]
    );

    await createNotification(
      request.buyer_id,
      "Pengajuan disetujui",
      `Pengajuan kamu untuk produk ${request.product_name} disetujui. Konfirmasi terlebih dahulu untuk membuka titik lokasi COD.`,
      "request"
    );

    return res.status(200).json({
      message:
        "Pengajuan berhasil disetujui. Pembeli perlu mengonfirmasi sebelum titik lokasi COD dibuka.",
      data: {
        request_id: Number(id),
        product_id: request.product_id,
        quantity_approved: requestQuantity,
        remaining_marketplace_quantity:
          remainingMarketplaceQuantity > 0 ? remainingMarketplaceQuantity : 0,
      },
    });
  } catch (error) {
    console.error("Approve request error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const sellerId = getUserId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [requests] = await db.query(
      `SELECT 
        pr.*, 
        mp.name AS product_name
       FROM purchase_requests pr
       JOIN marketplace_products mp ON pr.product_id = mp.id
       WHERE pr.id = ? AND pr.seller_id = ?`,
      [id, sellerId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        message: "Pengajuan tidak ditemukan atau bukan milik produk kamu",
      });
    }

    const request = requests[0];

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Pengajuan ini sudah diproses",
      });
    }

    await db.query(
      "UPDATE purchase_requests SET status = 'rejected', updated_at = NOW() WHERE id = ?",
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
      error: error.message,
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