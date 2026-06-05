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

    const [reviewsAsSeller] = await db.query(
      `SELECT
        tr.id,
        tr.transaction_id,
        tr.rating,
        tr.review,
        tr.created_at,
        tr.reviewed_role,

        t.product_id,

        COALESCE(mp.name, 'Produk Marketplace') AS product_name,
        COALESCE(mp.image_url, '') AS product_image,

        reviewer.id AS reviewer_id,
        reviewer.name AS reviewer_name,

        reviewed.id AS reviewed_user_id,
        reviewed.name AS reviewed_user_name
       FROM transaction_reviews tr
       JOIN transactions t ON tr.transaction_id = t.id
       LEFT JOIN marketplace_products mp ON t.product_id = mp.id
       LEFT JOIN users reviewer ON tr.reviewer_id = reviewer.id
       LEFT JOIN users reviewed ON tr.reviewed_user_id = reviewed.id
       WHERE tr.reviewed_user_id = ?
       AND tr.reviewed_role = 'seller'
       ORDER BY tr.created_at DESC`,
      [userId]
    );

    const [reviewsAsBuyer] = await db.query(
      `SELECT
        tr.id,
        tr.transaction_id,
        tr.rating,
        tr.review,
        tr.created_at,
        tr.reviewed_role,

        t.product_id,

        COALESCE(mp.name, 'Produk Marketplace') AS product_name,
        COALESCE(mp.image_url, '') AS product_image,

        reviewer.id AS reviewer_id,
        reviewer.name AS reviewer_name,

        reviewed.id AS reviewed_user_id,
        reviewed.name AS reviewed_user_name
       FROM transaction_reviews tr
       JOIN transactions t ON tr.transaction_id = t.id
       LEFT JOIN marketplace_products mp ON t.product_id = mp.id
       LEFT JOIN users reviewer ON tr.reviewer_id = reviewer.id
       LEFT JOIN users reviewed ON tr.reviewed_user_id = reviewed.id
       WHERE tr.reviewed_user_id = ?
       AND tr.reviewed_role = 'buyer'
       ORDER BY tr.created_at DESC`,
      [userId]
    );

    const [sellerRatingSummary] = await db.query(
      `SELECT 
        COUNT(*) AS total_reviews,
        AVG(rating) AS average_rating
       FROM transaction_reviews
       WHERE reviewed_user_id = ?
       AND reviewed_role = 'seller'`,
      [userId]
    );

    const [buyerRatingSummary] = await db.query(
      `SELECT 
        COUNT(*) AS total_reviews,
        AVG(rating) AS average_rating
       FROM transaction_reviews
       WHERE reviewed_user_id = ?
       AND reviewed_role = 'buyer'`,
      [userId]
    );

    const [transactionsSummary] = await db.query(
      `SELECT COUNT(*) AS total_transactions
       FROM transactions
       WHERE buyer_id = ? OR seller_id = ?`,
      [userId, userId]
    );

    const sellerRating = Number(sellerRatingSummary[0]?.average_rating || 0);
    const buyerRating = Number(buyerRatingSummary[0]?.average_rating || 0);

    const totalSellerReviews = Number(
      sellerRatingSummary[0]?.total_reviews || 0
    );

    const totalBuyerReviews = Number(
      buyerRatingSummary[0]?.total_reviews || 0
    );

    const totalReviews = totalSellerReviews + totalBuyerReviews;

    const averageRating =
      totalReviews > 0
        ? (
            (sellerRating * totalSellerReviews +
              buyerRating * totalBuyerReviews) /
            totalReviews
          ).toFixed(2)
        : "0.00";

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

        rating: averageRating,
        seller_rating: sellerRating.toFixed(2),
        buyer_rating: buyerRating.toFixed(2),

        total_reviews: totalReviews,
        total_seller_reviews: totalSellerReviews,
        total_buyer_reviews: totalBuyerReviews,

        total_transactions: Number(
          transactionsSummary[0]?.total_transactions || 0
        ),

        reviews_as_seller: reviewsAsSeller,
        reviews_as_buyer: reviewsAsBuyer,
        reviews: [...reviewsAsSeller, ...reviewsAsBuyer],
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