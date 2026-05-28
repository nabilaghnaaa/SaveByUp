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
        seller.name AS seller_name,
        seller.whatsapp AS seller_whatsapp
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
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

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

    if (transaction.status === "completed") {
      return res.status(400).json({
        message: "Transaksi ini sudah selesai",
      });
    }

    if (transaction.status === "cancelled") {
      return res.status(400).json({
        message: "Transaksi yang dibatalkan tidak bisa diselesaikan",
      });
    }

    if (transaction.status !== "waiting_cod") {
      return res.status(400).json({
        message: "Transaksi belum berada pada tahap COD yang bisa diselesaikan",
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
    const transactionQuantity = Number(transaction.quantity || 0);

    if (transactionQuantity <= 0) {
      return res.status(400).json({
        message: "Jumlah transaksi tidak valid",
      });
    }

    const [foods] = await db.query("SELECT * FROM foods WHERE id = ?", [
      product.food_id,
    ]);

    if (foods.length === 0) {
      return res.status(404).json({
        message: "Data makanan inventaris tidak ditemukan",
      });
    }

    const food = foods[0];

    if (Number(food.quantity) < transactionQuantity) {
      return res.status(400).json({
        message:
          "Stok inventaris tidak cukup untuk menyelesaikan transaksi ini.",
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

    const [updatedProducts] = await db.query(
      "SELECT quantity FROM marketplace_products WHERE id = ?",
      [transaction.product_id]
    );

    const currentMarketplaceQuantity = Number(
      updatedProducts[0]?.quantity || 0
    );

    await db.query(
      `UPDATE marketplace_products
       SET status = ?
       WHERE id = ?`,
      [
        currentMarketplaceQuantity > 0 ? "tersedia" : "selesai",
        transaction.product_id,
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

    if (transaction.status !== "completed") {
      return res.status(400).json({
        message: "Rating hanya bisa diberikan setelah transaksi selesai",
      });
    }

    if (transaction.rating) {
      return res.status(400).json({
        message: "Transaksi ini sudah pernah diberi rating",
      });
    }

    await db.query(
      "UPDATE transactions SET rating = ?, review = ? WHERE id = ?",
      [Number(rating), review || null, id]
    );

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
  completeTransaction,
  rateTransaction,
};