const db = require("../config/db");
const fs = require("fs");
const path = require("path");

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

const deleteOldProfilePhoto = (oldPhotoPath = "") => {
  try {
    if (!oldPhotoPath) return;

    if (!oldPhotoPath.startsWith("/uploads/profiles/")) return;

    const fileName = oldPhotoPath.replace("/uploads/profiles/", "");

    const fullPath = path.join(
      __dirname,
      "../../uploads/profiles",
      fileName
    );

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Delete old profile photo error:", error.message);
  }
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
    const photoPath = user.photo || user.avatar_url || "";
    const completeness = getProfileCompleteness(user);

    return res.status(200).json({
      message: "Profil berhasil diambil",
      data: {
        ...user,
        photo: photoPath,
        avatar_url: photoPath,
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

    const { name, phone, whatsapp, address, bio } = req.body;

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

    const [oldUsers] = await db.query(
      `SELECT id, photo, avatar_url
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (oldUsers.length === 0) {
      return res.status(404).json({
        message: "Profil pengguna tidak ditemukan",
      });
    }

    const oldUser = oldUsers[0];

    let photoPath = oldUser.photo || oldUser.avatar_url || "";

    if (req.file) {
      photoPath = `/uploads/profiles/${req.file.filename}`;

      deleteOldProfilePhoto(oldUser.photo || oldUser.avatar_url || "");
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
        photoPath || null,
        photoPath || null,
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

    const user = users[0] || {};
    const finalPhotoPath = user.photo || user.avatar_url || "";
    const completeness = getProfileCompleteness(user);

    return res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: {
        ...user,
        photo: finalPhotoPath,
        avatar_url: finalPhotoPath,
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