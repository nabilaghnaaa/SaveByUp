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
    is_profile_complete: missingFields.length === 0,
    missing_fields: missingFields,
  };
};

const getProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const [users] = await db.query(
      `SELECT 
        id, 
        name, 
        email, 
        phone,
        whatsapp, 
        address, 
        photo,
        avatar_url, 
        bio,
        rating
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Profil pengguna tidak ditemukan",
      });
    }

    const user = users[0];
    const completeness = getProfileCompleteness(user);

    return res.status(200).json({
      message: "Profil berhasil diambil",
      data: {
        ...user,
        ...completeness,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    const {
      name,
      phone,
      whatsapp,
      address,
      photo,
      avatar_url,
      bio,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    if (!String(name || "").trim()) {
      return res.status(400).json({
        message: "Nama wajib diisi",
      });
    }

    await db.query(
      `UPDATE users
       SET 
        name = ?, 
        phone = ?, 
        whatsapp = ?, 
        address = ?, 
        photo = ?,
        avatar_url = ?,
        bio = ?
       WHERE id = ?`,
      [
        String(name || "").trim(),
        phone || null,
        whatsapp || null,
        address || null,
        photo || null,
        avatar_url || photo || null,
        bio || null,
        userId,
      ]
    );

    const [users] = await db.query(
      `SELECT 
        id, 
        name, 
        email, 
        phone,
        whatsapp, 
        address, 
        photo,
        avatar_url, 
        bio,
        rating
       FROM users
       WHERE id = ?`,
      [userId]
    );

    const completeness = getProfileCompleteness(users[0] || {});

    return res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: {
        ...(users[0] || {}),
        ...completeness,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};