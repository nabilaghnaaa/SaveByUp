const db = require("../config/db");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return res.status(200).json({
      message: "Notifikasi berhasil diambil",
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    return res.status(200).json({
      message: "Notifikasi ditandai sudah dibaca",
    });
  } catch (error) {
    console.error("Mark notification error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const createExpiryNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [foods] = await db.query(
      `SELECT * FROM foods
       WHERE user_id = ?
       AND status = 'mendekati_kedaluwarsa'`,
      [userId]
    );

    for (const food of foods) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, 'expiry')`,
        [
          userId,
          "Makanan mendekati kedaluwarsa",
          `${food.name} mendekati tanggal kedaluwarsa. Segera konsumsi atau tawarkan jika masih layak.`,
        ]
      );
    }

    return res.status(201).json({
      message: "Notifikasi kedaluwarsa berhasil dibuat",
    });
  } catch (error) {
    console.error("Create expiry notifications error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  createExpiryNotifications,
};