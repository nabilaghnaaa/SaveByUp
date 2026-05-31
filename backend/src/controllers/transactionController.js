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

const hasCoordinate = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const buildMapsUrl = (latitude, longitude) => {
  if (!hasCoordinate(latitude, longitude)) return "";

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

const buildExactLocation = ({
  name,
  whatsapp,
  address,
  locationLabel,
  latitude,
  longitude,
  shared,
}) => {
  const isShared = Boolean(Number(shared || 0));
  const hasLocation = isShared && hasCoordinate(latitude, longitude);

  return {
    name: name || "",
    whatsapp: whatsapp || "",
    address: isShared ? address || "" : "",
    location_label: isShared ? locationLabel || address || "" : "",
    latitude: hasLocation ? Number(latitude) : null,
    longitude: hasLocation ? Number(longitude) : null,
    has_location: hasLocation,
    maps_url: hasLocation ? buildMapsUrl(latitude, longitude) : "",
    shared: isShared,
  };
};

const normalizeTransactionStatus = (status = "") => {
  const value = String(status || "").toLowerCase();

  const map = {
    waiting_buyer_confirmation: "menunggu_komunikasi",
    waiting_cod: "menunggu_komunikasi",
    menunggu_komunikasi: "menunggu_komunikasi",
    completed: "selesai",
    selesai: "selesai",
    cancelled: "dibatalkan",
    dibatalkan: "dibatalkan",
  };

  return map[value] || value || "menunggu_komunikasi";
};

const maskTransactionLocation = (transaction = {}, currentUserId) => {
  const isBuyer = Number(transaction.buyer_id) === Number(currentUserId);
  const isSeller = Number(transaction.seller_id) === Number(currentUserId);

  const buyerShared = Number(transaction.buyer_location_shared || 0) === 1;
  const sellerShared = Number(transaction.seller_location_shared || 0) === 1;
  const bothShared = buyerShared && sellerShared;

  const buyerLocation = buildExactLocation({
    name: transaction.buyer_name,
    whatsapp: transaction.buyer_whatsapp,
    address: transaction.buyer_address,
    locationLabel: transaction.buyer_location_label,
    latitude: transaction.buyer_latitude,
    longitude: transaction.buyer_longitude,
    shared: bothShared || isBuyer ? buyerShared : false,
  });

  const sellerLocation = buildExactLocation({
    name: transaction.seller_name,
    whatsapp: transaction.seller_whatsapp,
    address: transaction.seller_address,
    locationLabel: transaction.seller_location_label,
    latitude: transaction.seller_latitude,
    longitude: transaction.seller_longitude,
    shared: bothShared || isSeller ? sellerShared : false,
  });

  const waitingParty =
    !buyerShared && !sellerShared
      ? "pembeli dan penjual"
      : !buyerShared
        ? "pembeli"
        : !sellerShared
          ? "penjual"
          : "";

  return {
    ...transaction,

    status: normalizeTransactionStatus(transaction.status),

    buyer_location_shared: buyerShared,
    seller_location_shared: sellerShared,
    both_location_shared: bothShared,
    exact_location_available: bothShared,

    current_user_role: isBuyer ? "buyer" : isSeller ? "seller" : "unknown",
    current_user_has_shared_location: isBuyer ? buyerShared : sellerShared,
    waiting_location_party: waitingParty,

    buyer_location: buyerLocation,
    seller_location: sellerLocation,

    buyer_latitude: bothShared ? transaction.buyer_latitude : null,
    buyer_longitude: bothShared ? transaction.buyer_longitude : null,
    seller_latitude: bothShared ? transaction.seller_latitude : null,
    seller_longitude: bothShared ? transaction.seller_longitude : null,
  };
};

const getTransactions = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [transactions] = await db.query(
      `SELECT 
        t.*,

        mp.name AS product_name,
        mp.image_url AS product_image,

        buyer.name AS buyer_name,
        buyer.whatsapp AS buyer_whatsapp,
        buyer.address AS buyer_address,

        seller.name AS seller_name,
        seller.whatsapp AS seller_whatsapp,
        seller.address AS seller_address
       FROM transactions t
       JOIN marketplace_products mp ON t.product_id = mp.id
       JOIN users buyer ON t.buyer_id = buyer.id
       JOIN users seller ON t.seller_id = seller.id
       WHERE t.buyer_id = ? OR t.seller_id = ?
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );

    return res.status(200).json({
      message: "Riwayat transaksi berhasil diambil",
      data: transactions.map((item) => maskTransactionLocation(item, userId)),
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const shareTransactionLocation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [transactions] = await db.query(
      `SELECT *
       FROM transactions
       WHERE id = ?
       AND (buyer_id = ? OR seller_id = ?)`,
      [id, userId, userId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan atau bukan milik kamu.",
      });
    }

    const transaction = transactions[0];
    const isBuyer = Number(transaction.buyer_id) === Number(userId);
    const isSeller = Number(transaction.seller_id) === Number(userId);

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses ke transaksi ini.",
      });
    }

    if (["completed", "selesai", "cancelled", "dibatalkan"].includes(transaction.status)) {
      return res.status(400).json({
        message: "Lokasi tidak bisa dibagikan karena transaksi sudah selesai atau dibatalkan.",
      });
    }

    const [users] = await db.query(
      `SELECT 
        id,
        name,
        whatsapp,
        address,
        latitude,
        longitude,
        location_label,
        location_updated_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Data user tidak ditemukan.",
      });
    }

    const user = users[0];

    if (!hasCoordinate(user.latitude, user.longitude)) {
      return res.status(400).json({
        message:
          "Titik lokasi belum tersedia. Lengkapi lokasi GPS di halaman profil terlebih dahulu.",
      });
    }

    if (isBuyer && Number(transaction.buyer_location_shared || 0) === 1) {
      return res.status(400).json({
        message:
          "Lokasi pembeli sudah pernah dibagikan. Ubah lokasi di profil jika ingin memperbarui titik COD.",
      });
    }

    if (isSeller && Number(transaction.seller_location_shared || 0) === 1) {
      return res.status(400).json({
        message:
          "Lokasi penjual sudah pernah dibagikan. Ubah lokasi di profil jika ingin memperbarui titik COD.",
      });
    }

    if (isBuyer) {
      await db.query(
        `UPDATE transactions
         SET
          buyer_latitude = ?,
          buyer_longitude = ?,
          buyer_location_label = ?,
          buyer_location_shared = 1,
          buyer_location_shared_at = NOW()
         WHERE id = ?
         AND buyer_id = ?`,
        [
          user.latitude,
          user.longitude,
          user.location_label || user.address || "",
          id,
          userId,
        ]
      );

      await createNotification(
        transaction.seller_id,
        "Pembeli membagikan lokasi COD",
        "Pembeli sudah membagikan titik lokasi COD. Bagikan lokasi kamu agar titik temu bisa dilihat bersama.",
        "transaction"
      );
    }

    if (isSeller) {
      await db.query(
        `UPDATE transactions
         SET
          seller_latitude = ?,
          seller_longitude = ?,
          seller_location_label = ?,
          seller_location_shared = 1,
          seller_location_shared_at = NOW()
         WHERE id = ?
         AND seller_id = ?`,
        [
          user.latitude,
          user.longitude,
          user.location_label || user.address || "",
          id,
          userId,
        ]
      );

      await createNotification(
        transaction.buyer_id,
        "Penjual membagikan lokasi COD",
        "Penjual sudah membagikan titik lokasi COD. Bagikan lokasi kamu agar titik temu bisa dilihat bersama.",
        "transaction"
      );
    }

    return res.status(200).json({
      message: "Lokasi COD berhasil dibagikan.",
    });
  } catch (error) {
    console.error("Share transaction location error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const completeTransaction = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [transactions] = await db.query(
      "SELECT * FROM transactions WHERE id = ? AND (buyer_id = ? OR seller_id = ?)",
      [id, userId, userId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    const transaction = transactions[0];

    if (["completed", "selesai"].includes(transaction.status)) {
      return res.status(400).json({
        message: "Transaksi ini sudah selesai",
      });
    }

    if (["cancelled", "dibatalkan"].includes(transaction.status)) {
      return res.status(400).json({
        message: "Transaksi yang dibatalkan tidak bisa diselesaikan",
      });
    }

    const [products] = await db.query(
      "SELECT * FROM marketplace_products WHERE id = ?",
      [transaction.product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Produk marketplace tidak ditemukan",
      });
    }

    const product = products[0];
    const transactionQuantity = Number(transaction.quantity || 1);
    const marketplaceQuantity = Number(product.quantity || 0);
    const remainingMarketplaceQuantity = marketplaceQuantity - transactionQuantity;

    if (transactionQuantity <= 0) {
      return res.status(400).json({
        message: "Jumlah transaksi tidak valid",
      });
    }

    if (marketplaceQuantity <= 0) {
      return res.status(400).json({
        message: "Stok produk marketplace sudah habis",
      });
    }

    if (transactionQuantity > marketplaceQuantity) {
      return res.status(400).json({
        message: "Jumlah transaksi melebihi stok marketplace",
      });
    }

    await db.query(
      "UPDATE transactions SET status = 'completed', completed_at = NOW() WHERE id = ?",
      [id]
    );

    if (transaction.purchase_request_id) {
      await db.query(
        "UPDATE purchase_requests SET status = 'completed', updated_at = NOW() WHERE id = ?",
        [transaction.purchase_request_id]
      );
    }

    await db.query(
      `UPDATE marketplace_products
       SET
        quantity = ?,
        stock = ?,
        status = ?
       WHERE id = ?`,
      [
        remainingMarketplaceQuantity > 0 ? remainingMarketplaceQuantity : 0,
        remainingMarketplaceQuantity > 0 ? remainingMarketplaceQuantity : 0,
        remainingMarketplaceQuantity > 0 ? "tersedia" : "selesai",
        transaction.product_id,
      ]
    );

    await db.query(
      `UPDATE foods
       SET
        quantity = GREATEST(quantity - ?, 0),
        status = CASE
          WHEN GREATEST(quantity - ?, 0) <= 0 THEN 'terjual'
          ELSE status
        END,
        priority = CASE
          WHEN GREATEST(quantity - ?, 0) <= 0 THEN 'selesai'
          ELSE priority
        END
       WHERE id = ?`,
      [
        transactionQuantity,
        transactionQuantity,
        transactionQuantity,
        product.food_id,
      ]
    );

    const receiverId =
      Number(transaction.buyer_id) === Number(userId)
        ? transaction.seller_id
        : transaction.buyer_id;

    await createNotification(
      receiverId,
      "Transaksi selesai",
      "Salah satu transaksi SaveByUp telah ditandai selesai.",
      "transaction"
    );

    return res.status(200).json({
      message: "Transaksi berhasil diselesaikan",
      data: {
        transaction_id: Number(id),
        product_id: transaction.product_id,
        quantity_sold: transactionQuantity,
        remaining_marketplace_quantity:
          remainingMarketplaceQuantity > 0 ? remainingMarketplaceQuantity : 0,
      },
    });
  } catch (error) {
    console.error("Complete transaction error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const rateTransaction = async (req, res) => {
  try {
    const buyerId = getUserId(req);
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!buyerId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating harus bernilai 1 sampai 5",
      });
    }

    const [transactions] = await db.query(
      "SELECT * FROM transactions WHERE id = ? AND buyer_id = ?",
      [id, buyerId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    const transaction = transactions[0];

    if (!["completed", "selesai"].includes(transaction.status)) {
      return res.status(400).json({
        message: "Rating hanya bisa diberikan setelah transaksi selesai",
      });
    }

    await db.query("UPDATE transactions SET rating = ?, review = ? WHERE id = ?", [
      Number(rating),
      review || null,
      id,
    ]);

    const [avgRating] = await db.query(
      "SELECT AVG(rating) AS avg_rating FROM transactions WHERE seller_id = ? AND rating IS NOT NULL",
      [transaction.seller_id]
    );

    await db.query("UPDATE users SET rating = ? WHERE id = ?", [
      Number(avgRating[0].avg_rating || 0).toFixed(2),
      transaction.seller_id,
    ]);

    return res.status(200).json({
      message: "Rating berhasil diberikan",
    });
  } catch (error) {
    console.error("Rate transaction error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  getTransactions,
  shareTransactionLocation,
  completeTransaction,
  rateTransaction,
};