import API from "./api";

const normalizeTransaction = (transaction = {}) => ({
  id: transaction.id,
  request_id: transaction.request_id,
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
  status: transaction.status || "menunggu_komunikasi",
  rating: transaction.rating,
  review: transaction.review || "",
  created_at: transaction.created_at,
  completed_at: transaction.completed_at,
});

export const getTransactions = async () => {
  const response = await API.get("/transactions");
  const transactions = response.data.data || [];

  return Array.isArray(transactions)
    ? transactions.map(normalizeTransaction)
    : [];
};

export const completeTransaction = async (id) => {
  const response = await API.patch(`/transactions/${id}/complete`);
  return response.data;
};

export const rateTransaction = async (id, payload) => {
  const response = await API.patch(`/transactions/${id}/rating`, {
    rating: Number(payload.rating),
    review: payload.review || "",
  });

  return response.data;
};