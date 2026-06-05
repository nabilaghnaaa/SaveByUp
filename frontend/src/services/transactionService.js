import API from "./api";

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStatus = (status = "") => {
  const value = String(status || "").toLowerCase();

  const map = {
    waiting_buyer_confirmation: "menunggu_komunikasi",
    waiting_cod: "menunggu_komunikasi",
    menunggu_komunikasi: "menunggu_komunikasi",

    completed: "selesai",
    selesai: "selesai",

    cancelled: "dibatalkan",
    dibatalkan: "dibatalkan",
  };

  return map[value] || value || "menunggu_komunikasi";
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
  shared: Boolean(location.shared),
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

    buyer_location_shared: Boolean(transaction.buyer_location_shared),
    seller_location_shared: Boolean(transaction.seller_location_shared),
    both_location_shared: Boolean(transaction.both_location_shared),
    exact_location_available: Boolean(transaction.exact_location_available),
    current_user_role: transaction.current_user_role || "",
    current_user_has_shared_location: Boolean(
      transaction.current_user_has_shared_location
    ),
    waiting_location_party: transaction.waiting_location_party || "",

    buyer_location: normalizeLocation(transaction.buyer_location),
    seller_location: normalizeLocation(transaction.seller_location),

    status,

    current_user_review_id: transaction.current_user_review_id || null,
    current_user_has_reviewed: Boolean(transaction.current_user_review_id),
    current_user_review_rating:
      transaction.current_user_review_rating !== null &&
      transaction.current_user_review_rating !== undefined
        ? Number(transaction.current_user_review_rating)
        : null,
    current_user_review_text: transaction.current_user_review_text || "",
    current_user_reviewed_role: transaction.current_user_reviewed_role || "",

    other_user_review_id: transaction.other_user_review_id || null,
    other_user_has_reviewed: Boolean(transaction.other_user_review_id),
    other_user_review_rating:
      transaction.other_user_review_rating !== null &&
      transaction.other_user_review_rating !== undefined
        ? Number(transaction.other_user_review_rating)
        : null,
    other_user_review_text: transaction.other_user_review_text || "",
    other_user_reviewed_role: transaction.other_user_reviewed_role || "",

    rating:
      transaction.current_user_review_rating ||
      transaction.rating ||
      null,
    review:
      transaction.current_user_review_text ||
      transaction.review ||
      "",

    created_at: transaction.created_at,
    completed_at: transaction.completed_at,

    buyer_location_shared_at: transaction.buyer_location_shared_at,
    seller_location_shared_at: transaction.seller_location_shared_at,
  };
};

export const getTransactions = async () => {
  const response = await API.get("/transactions");
  const transactions = response.data.data || [];

  return Array.isArray(transactions)
    ? transactions.map(normalizeTransaction)
    : [];
};

export const shareTransactionLocation = async (id) => {
  const response = await API.patch(`/transactions/${id}/share-location`);
  return response.data;
};

export const completeTransaction = async (id) => {
  const response = await API.patch(`/transactions/${id}/complete`);
  return response.data;
};

export const completeTransactionWithRating = async (id, payload) => {
  const response = await API.patch(`/transactions/${id}/complete-with-rating`, {
    rating: Number(payload.rating),
    review: payload.review || "",
  });

  return response.data;
};

export const rateTransaction = async (id, payload) => {
  const response = await API.patch(`/transactions/${id}/rate`, {
    rating: Number(payload.rating),
    review: payload.review || "",
  });

  return response.data;
};