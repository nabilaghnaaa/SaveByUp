import API from "./api";

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStatus = (status = "") => {
  const value = String(status || "").toLowerCase();

  const map = {
    waiting_buyer_confirmation: "waiting_buyer_confirmation",
    menunggu_konfirmasi_pembeli: "waiting_buyer_confirmation",

    waiting_cod: "waiting_cod",
    menunggu_komunikasi: "waiting_cod",

    completed: "completed",
    selesai: "completed",

    cancelled: "cancelled",
    dibatalkan: "cancelled",
  };

  return map[value] || value || "waiting_buyer_confirmation";
};

const normalizeLocation = (location = {}) => ({
  name: location.name || "",
  whatsapp: location.whatsapp || "",
  address: location.address || "",
  location_label: location.location_label || "",
  latitude: toNullableNumber(location.latitude),
  longitude: toNullableNumber(location.longitude),
  has_location: Boolean(location.has_location),
  maps_url: location.maps_url || "",
});

const normalizeTransaction = (transaction = {}) => {
  const status = normalizeStatus(transaction.status);

  return {
    id: transaction.id,
    purchase_request_id: transaction.purchase_request_id,
    request_id: transaction.purchase_request_id || transaction.request_id,

    product_id: transaction.product_id,
    product_name: transaction.product_name || "",
    product_image: transaction.product_image || "",

    buyer_id: transaction.buyer_id,
    buyer_name: transaction.buyer_name || "",
    buyer_whatsapp: transaction.buyer_whatsapp || "",

    seller_id: transaction.seller_id,
    seller_name: transaction.seller_name || "",
    seller_whatsapp: transaction.seller_whatsapp || "",

    quantity: Number(transaction.quantity || 0),
    final_price: Number(transaction.final_price || 0),
    total_price: Number(transaction.total_price || 0),

    cod_location: transaction.cod_location || "",
    cod_time: transaction.cod_time || "",

    buyer_latitude: toNullableNumber(transaction.buyer_latitude),
    buyer_longitude: toNullableNumber(transaction.buyer_longitude),
    seller_latitude: toNullableNumber(transaction.seller_latitude),
    seller_longitude: toNullableNumber(transaction.seller_longitude),
    seller_location_label: transaction.seller_location_label || "",

    buyer_location: normalizeLocation(transaction.buyer_location),
    seller_location: normalizeLocation(transaction.seller_location),

    location_revealed: Boolean(Number(transaction.location_revealed || 0)),
    exact_location_available: Boolean(transaction.exact_location_available),

    status,
    rating: transaction.rating,
    review: transaction.review || "",

    created_at: transaction.created_at,
    completed_at: transaction.completed_at,
    location_confirmed_at: transaction.location_confirmed_at,
  };
};

export const getTransactions = async () => {
  const response = await API.get("/transactions");
  const transactions = response.data.data || [];

  return Array.isArray(transactions)
    ? transactions.map(normalizeTransaction)
    : [];
};

export const confirmTransactionLocation = async (id) => {
  const response = await API.patch(`/transactions/${id}/confirm-location`);

  return response.data;
};

export const completeTransaction = async (id) => {
  const response = await API.patch(`/transactions/${id}/complete`);

  return response.data;
};

export const rateTransaction = async (id, payload) => {
  const response = await API.patch(`/transactions/${id}/rate`, {
    rating: Number(payload.rating),
    review: payload.review || "",
  });

  return response.data;
};