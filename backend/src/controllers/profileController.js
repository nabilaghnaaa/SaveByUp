const db = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      `SELECT id, name, email, whatsapp, address, avatar_url, rating
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Profil pengguna tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Profil berhasil diambil",
      data: users[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, whatsapp, address, avatar_url } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nama wajib diisi",
      });
    }

    await db.query(
      `UPDATE users
       SET name = ?, whatsapp = ?, address = ?, avatar_url = ?
       WHERE id = ?`,
      [name, whatsapp || null, address || null, avatar_url || null, userId]
    );

    return res.status(200).json({
      message: "Profil berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};