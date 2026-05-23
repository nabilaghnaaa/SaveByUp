const db = require("../config/db");

const createNotification = async (userId, title, message, type = "system") => {
  await db.query(
    "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
    [userId, title, message, type]
  );
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

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
    });
  }
};

const completeTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

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

    await db.query(
      "UPDATE transactions SET status = 'selesai', completed_at = NOW() WHERE id = ?",
      [id]
    );

    await db.query(
      "UPDATE marketplace_products SET status = 'selesai' WHERE id = ?",
      [transaction.product_id]
    );

    await db.query(
      "UPDATE foods SET status = 'terjual' WHERE id = (SELECT food_id FROM marketplace_products WHERE id = ?)",
      [transaction.product_id]
    );

    const receiverId =
      transaction.buyer_id === userId ? transaction.seller_id : transaction.buyer_id;

    await createNotification(
      receiverId,
      "Transaksi selesai",
      "Salah satu transaksi SaveByUp telah ditandai selesai.",
      "transaction"
    );

    return res.status(200).json({
      message: "Transaksi berhasil diselesaikan",
    });
  } catch (error) {
    console.error("Complete transaction error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const rateTransaction = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;
    const { rating, review } = req.body;

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

    if (transaction.status !== "selesai") {
      return res.status(400).json({
        message: "Rating hanya bisa diberikan setelah transaksi selesai",
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
    });
  }
};

module.exports = {
  getTransactions,
  completeTransaction,
  rateTransaction,
};