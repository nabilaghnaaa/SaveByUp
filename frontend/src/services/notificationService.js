import API from "./api";

export const normalizeNotificationType = (type = "", notification = {}) => {
  const rawType = String(type || notification.type || "").toLowerCase();
  const title = String(notification.title || "").toLowerCase();
  const message = String(notification.message || "").toLowerCase();

  const text = `${rawType} ${title} ${message}`;

  if (
    text.includes("kedaluwarsa") ||
    text.includes("expired") ||
    text.includes("expiry") ||
    text.includes("reminder")
  ) {
    return "expiry";
  }

  if (
    text.includes("pengajuan") ||
    text.includes("pembelian baru") ||
    text.includes("purchase_request") ||
    text.includes("request") ||
    text.includes("negosiasi") ||
    text.includes("penawaran")
  ) {
    return "request";
  }

  if (
    text.includes("transaksi") ||
    text.includes("transaction") ||
    text.includes("cod") ||
    text.includes("selesai") ||
    text.includes("rating")
  ) {
    return "transaction";
  }

  return "system";
};

const normalizeBoolean = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  const stringValue = String(value ?? "").toLowerCase();

  if (stringValue === "true" || stringValue === "1" || stringValue === "read") {
    return true;
  }

  if (
    stringValue === "false" ||
    stringValue === "0" ||
    stringValue === "unread" ||
    stringValue === "belum_dibaca"
  ) {
    return false;
  }

  return false;
};

const normalizeNotification = (notification = {}) => {
  const normalizedType = normalizeNotificationType(notification.type, notification);

  return {
    id: notification.id,
    user_id: notification.user_id,
    title: notification.title || "",
    message: notification.message || "",
    type: normalizedType,
    original_type: notification.type || "system",

    is_read: normalizeBoolean(
      notification.is_read ?? notification.read ?? notification.status
    ),

    created_at: notification.created_at,
    updated_at: notification.updated_at,
  };
};

export const getNotifications = async () => {
  try {
    const response = await API.get("/notifications");
    const notifications = response.data.data || response.data || [];

    return Array.isArray(notifications)
      ? notifications.map(normalizeNotification)
      : [];
  } catch (error) {
    console.error("Get notifications service error:", error);
    return [];
  }
};

export const getUnreadNotifications = async () => {
  const notifications = await getNotifications();

  return notifications.filter((notification) => !notification.is_read);
};

export const getUnreadNotificationCount = async () => {
  const unreadNotifications = await getUnreadNotifications();

  return unreadNotifications.length;
};

export const markNotificationAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const notifications = await getUnreadNotifications();

  await Promise.all(
    notifications.map((notification) => markNotificationAsRead(notification.id))
  );

  return {
    message: "Semua notifikasi berhasil ditandai sudah dibaca",
    total: notifications.length,
  };
};

export const generateExpiryNotifications = async () => {
  const response = await API.post("/notifications/expiry/generate");
  return response.data;
};