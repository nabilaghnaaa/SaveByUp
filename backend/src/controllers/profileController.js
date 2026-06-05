const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const {
  normalizeCoordinate,
  isValidCoordinate,
} = require("../utils/location.util");

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.userId;
};

const normalizePhone = (value = "") => {
  return String(value || "")
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");
};

const getProfileCompleteness = (user = {}) => {
  const missingFields = [];

  if (!String(user.name || "").trim()) missingFields.push("name");
  if (!String(user.email || "").trim()) missingFields.push("email");
  if (!String(user.whatsapp || "").trim()) missingFields.push("whatsapp");
  if (!String(user.address || "").trim()) missingFields.push("address");

  return {
    is_profile_complete: missingFields.length === 0,
    missing_fields: missingFields,
  };
};

const validateProfilePayload = ({
  name,
  phone,
  whatsapp,
  address,
  bio,
  latitude,
  longitude,
  location_label,
}) => {
  const cleanName = String(name || "").trim();
  const cleanPhone = normalizePhone(phone);
  const cleanWhatsapp = normalizePhone(whatsapp);
  const cleanAddress = String(address || "").trim();
  const cleanBio = String(bio || "").trim();
  const cleanLocationLabel = String(location_label || "").trim();

  if (!cleanName) return "Nama wajib diisi.";
  if (cleanName.length < 3) return "Nama minimal 3 karakter.";
  if (cleanName.length > 80) return "Nama maksimal 80 karakter.";

  if (cleanPhone && !/^\+?\d{8,15}$/.test(cleanPhone)) {
    return "Nomor HP harus berisi angka 8 sampai 15 digit.";
  }

  if (!cleanWhatsapp) return "Nomor WhatsApp wajib diisi.";

  if (!/^\+?\d{8,15}$/.test(cleanWhatsapp)) {
    return "Nomor WhatsApp harus berisi angka 8 sampai 15 digit.";
  }

  if (!cleanAddress) return "Area COD wajib diisi.";
  if (cleanAddress.length < 5) return "Area COD terlalu pendek.";
  if (cleanAddress.length > 220) return "Area COD maksimal 220 karakter.";

  if (cleanBio.length > 160) return "Bio maksimal 160 karakter.";

  if (cleanLocationLabel.length > 255) {
    return "Label lokasi maksimal 255 karakter.";
  }

  const hasLat = latitude !== null && latitude !== undefined && latitude !== "";
  const hasLng =
    longitude !== null && longitude !== undefined && longitude !== "";

  if ((hasLat || hasLng) && !isValidCoordinate(latitude, longitude)) {
    return "Titik lokasi tidak valid.";
  }

  return "";
};

const deleteUploadedFile = (filePath = "") => {
  try {
    if (!filePath) return;

    let fullPath = filePath;

    if (filePath.startsWith("/uploads/profiles/")) {
      const fileName = filePath.replace("/uploads/profiles/", "");

      fullPath = path.join(__dirname, "../../uploads/profiles", fileName);
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Delete uploaded profile photo error:", error.message);
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
        latitude,
        longitude,
        location_label,
        location_updated_at,
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
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    const user = users[0];
    const photoPath = user.photo || user.avatar_url || "";
    const completeness = getProfileCompleteness(user);

    return res.status(200).json({
      message: "Profil berhasil diambil.",
      data: {
        ...user,
        photo: photoPath,
        avatar_url: photoPath,
        has_location: Boolean(user.latitude && user.longitude),
        ...completeness,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const { userId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    if (!userId || Number.isNaN(Number(userId))) {
      return res.status(400).json({
        message: "ID pengguna tidak valid.",
      });
    }

    const [users] = await db.query(
      `SELECT 
        id,
        name,
        email,
        whatsapp,
        address,
        location_label,
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
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    const user = users[0];
    const photoPath = user.photo || user.avatar_url || "";

    const [ratingSummary] = await db.query(
      `SELECT 
        COUNT(*) AS total_reviews,
        AVG(rating) AS average_rating
       FROM transactions
       WHERE rating IS NOT NULL
       AND review IS NOT NULL
       AND review <> ''
       AND (buyer_id = ? OR seller_id = ?)`,
      [userId, userId]
    );

    const [reviews] = await db.query(
      `SELECT
        t.id,
        t.id AS transaction_id,
        t.product_id,
        t.rating,
        t.review,
        t.completed_at,
        t.created_at,

        mp.name AS product_name,
        mp.image_url AS product_image,

        buyer.id AS buyer_id,
        buyer.name AS buyer_name,

        seller.id AS seller_id,
        seller.name AS seller_name,

        CASE
          WHEN t.buyer_id = ? THEN seller.id
          ELSE buyer.id
        END AS reviewer_id,

        CASE
          WHEN t.buyer_id = ? THEN seller.name
          ELSE buyer.name
        END AS reviewer_name
       FROM transactions t
       LEFT JOIN marketplace_products mp ON t.product_id = mp.id
       LEFT JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users seller ON t.seller_id = seller.id
       WHERE t.rating IS NOT NULL
       AND t.review IS NOT NULL
       AND t.review <> ''
       AND (t.buyer_id = ? OR t.seller_id = ?)
       ORDER BY COALESCE(t.completed_at, t.created_at) DESC
       LIMIT 20`,
      [userId, userId, userId, userId]
    );

    const [transactionsSummary] = await db.query(
      `SELECT COUNT(*) AS total_transactions
       FROM transactions
       WHERE buyer_id = ? OR seller_id = ?`,
      [userId, userId]
    );

    return res.status(200).json({
      message: "Profil publik berhasil diambil.",
      data: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        whatsapp: user.whatsapp || "",
        address: user.address || "",
        location_label: user.location_label || "",
        photo: photoPath,
        avatar_url: photoPath,
        bio: user.bio || "",
        rating: Number(
          ratingSummary[0]?.average_rating || user.rating || 0
        ).toFixed(2),
        total_reviews: Number(ratingSummary[0]?.total_reviews || 0),
        total_transactions: Number(
          transactionsSummary[0]?.total_transactions || 0
        ),
        reviews,
      },
    });
  } catch (error) {
    console.error("Get public profile error:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    const {
      name = "",
      phone = "",
      whatsapp = "",
      address = "",
      bio = "",
      latitude = "",
      longitude = "",
      location_label = "",
    } = req.body;

    if (!userId) {
      if (req.file) deleteUploadedFile(req.file.path);

      return res.status(401).json({
        message: "User tidak terautentikasi.",
      });
    }

    const validationMessage = validateProfilePayload({
      name,
      phone,
      whatsapp,
      address,
      bio,
      latitude,
      longitude,
      location_label,
    });

    if (validationMessage) {
      if (req.file) deleteUploadedFile(req.file.path);

      return res.status(400).json({
        message: validationMessage,
      });
    }

    const [oldUsers] = await db.query(
      `SELECT id, photo, avatar_url
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (oldUsers.length === 0) {
      if (req.file) deleteUploadedFile(req.file.path);

      return res.status(404).json({
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    const oldUser = oldUsers[0];

    let photoPath = oldUser.photo || oldUser.avatar_url || "";

    if (req.file) {
      photoPath = `/uploads/profiles/${req.file.filename}`;

      deleteUploadedFile(oldUser.photo || oldUser.avatar_url || "");
    }

    const normalizedLatitude = normalizeCoordinate(latitude);
    const normalizedLongitude = normalizeCoordinate(longitude);

    const shouldUpdateLocationTime =
      normalizedLatitude !== null && normalizedLongitude !== null;

    await db.query(
      `UPDATE users
       SET 
        name = ?, 
        phone = ?, 
        whatsapp = ?, 
        address = ?,
        latitude = ?,
        longitude = ?,
        location_label = ?,
        location_updated_at = CASE
          WHEN ? = 1 THEN NOW()
          ELSE location_updated_at
        END,
        photo = ?,
        avatar_url = ?,
        bio = ?
       WHERE id = ?`,
      [
        String(name || "").trim(),
        normalizePhone(phone) || null,
        normalizePhone(whatsapp) || null,
        String(address || "").trim() || null,
        normalizedLatitude,
        normalizedLongitude,
        String(location_label || "").trim() || null,
        shouldUpdateLocationTime ? 1 : 0,
        photoPath || null,
        photoPath || null,
        String(bio || "").trim() || null,
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
        latitude,
        longitude,
        location_label,
        location_updated_at,
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
      message: "Profil berhasil diperbarui.",
      data: {
        ...user,
        photo: finalPhotoPath,
        avatar_url: finalPhotoPath,
        has_location: Boolean(user.latitude && user.longitude),
        ...completeness,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (req.file) deleteUploadedFile(req.file.path);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  getPublicProfile,
  updateProfile,
};