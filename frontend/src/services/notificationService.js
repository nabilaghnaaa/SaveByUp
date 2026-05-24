import API from "./api";

const normalizeNotification = (notification = {}) => ({
  id: notification.id,
  user_id: notification.user_id,
  title: notification.title || "",
  message: notification.message || "",
  type: notification.type || "system",
  is_read: Boolean(Number(notification.is_read)),
  created_at: notification.created_at,
});

export const getNotifications = async () => {
  const response = await API.get("/notifications");
  const notifications = response.data.data || [];

  return Array.isArray(notifications)
    ? notifications.map(normalizeNotification)
    : [];
};

export const markNotificationAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

export const generateExpiryNotifications = async () => {
  const response = await API.post("/notifications/expiry/generate");
  return response.data;
};