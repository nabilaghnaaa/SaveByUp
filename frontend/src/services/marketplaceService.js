import API from "./api";

const normalizeProduct = (product = {}) => ({
  id: product.id,
  food_id: product.food_id,
  seller_id: product.seller_id,
  seller_name: product.seller_name || "Penjual SaveByUp",
  seller_email: product.seller_email || "",
  seller_whatsapp: product.seller_whatsapp || "",
  seller_address: product.seller_address || "Area kos UMY",
  seller_rating: Number(product.seller_rating || 0),
  name: product.name || "",
  category: product.category || "",
  description: product.description || "",
  quantity: Number(product.quantity || product.stock || 0),
  stock: Number(product.stock || product.quantity || 0),
  unit: product.unit || "pcs",
  price: Number(product.price || 0),
  expiry_date: product.expiry_date ? String(product.expiry_date).slice(0, 10) : "",
  image_url: product.image_url || product.image || "",
  image: product.image || product.image_url || "",
  location: product.location || "",
  status: product.status || "tersedia",
  created_at: product.created_at,
  updated_at: product.updated_at,
});

const normalizeRequestStatus = (status) => {
  const statusMap = {
    pending: "pending",
    accepted: "accepted",
    rejected: "rejected",
    cancelled: "cancelled",
    completed: "completed",

    menunggu: "pending",
    disetujui: "accepted",
    ditolak: "rejected",
    dibatalkan: "cancelled",
    selesai: "completed",
  };

  return statusMap[status] || status || "pending";
};

const normalizeRequest = (request = {}) => ({
  id: request.id,
  product_id: request.product_id,
  product_name: request.product_name || "",
  product_image: request.product_image || "",
  buyer_id: request.buyer_id,
  buyer_name: request.buyer_name || "",
  buyer_email: request.buyer_email || "",
  buyer_whatsapp: request.buyer_whatsapp || "",
  seller_id: request.seller_id,
  seller_name: request.seller_name || "",
  seller_whatsapp: request.seller_whatsapp || "",
  quantity: Number(request.quantity || 0),
  original_price: Number(request.original_price || 0),
  offer_price: Number(request.offer_price || 0),
  is_negotiated: Boolean(request.is_negotiated),
  cod_location: request.cod_location || "",
  cod_time: request.cod_time || "",
  note: request.note || "",
  status: normalizeRequestStatus(request.status),
  created_at: request.created_at,
  updated_at: request.updated_at,
  responded_at: request.responded_at,
});

export const getMarketplaceProducts = async () => {
  try {
    const response = await API.get("/marketplace");
    const products = response.data.data || response.data || [];

    return Array.isArray(products) ? products.map(normalizeProduct) : [];
  } catch (error) {
    console.error("Get marketplace products service error:", error);
    return [];
  }
};

export const getMarketplaceProductById = async (id) => {
  const response = await API.get(`/marketplace/${id}`);
  return normalizeProduct(response.data.data || response.data);
};

export const createMarketplaceProduct = async (foodId, payload) => {
  const response = await API.post(`/marketplace/sell/${foodId}`, {
    quantity: Number(payload.quantity || 1),
    price: Number(payload.price || 0),
    description: payload.description || "",
  });

  return response.data;
};

export const updateMarketplaceProduct = async (id, payload) => {
  const response = await API.put(`/marketplace/${id}`, {
    quantity: Number(payload.quantity || 1),
    price: Number(payload.price || 0),
    description: payload.description || "",
  });

  return response.data;
};

export const cancelMarketplaceProduct = async (id) => {
  const response = await API.patch(`/marketplace/${id}/cancel`);
  return response.data;
};

export const deleteMarketplaceProduct = async (id) => {
  const response = await API.delete(`/marketplace/${id}`);
  return response.data;
};

export const createPurchaseRequest = async ({
  productId,
  quantity,
  offerPrice,
  note,
}) => {
  const response = await API.post(`/requests/${productId}`, {
    quantity: Number(quantity || 1),
    offer_price: Number(offerPrice || 0),
    note: note || "",
  });

  return response.data;
};

export const getIncomingRequests = async () => {
  try {
    const response = await API.get("/requests/incoming");
    const requests = response.data.data || response.data || [];

    return Array.isArray(requests) ? requests.map(normalizeRequest) : [];
  } catch (error) {
    console.error("Get incoming requests service error:", error);
    return [];
  }
};

export const getMyRequests = async () => {
  try {
    const response = await API.get("/requests/mine");
    const requests = response.data.data || response.data || [];

    return Array.isArray(requests) ? requests.map(normalizeRequest) : [];
  } catch (error) {
    console.error("Get my requests service error:", error);
    return [];
  }
};

export const approveRequest = async (id) => {
  const response = await API.patch(`/requests/${id}/approve`);
  return response.data;
};

export const rejectRequest = async (id) => {
  const response = await API.patch(`/requests/${id}/reject`);
  return response.data;
};

export const isOwnProduct = (product, currentUserId) => {
  return Number(product?.seller_id) === Number(currentUserId);
};

export const canBuyProduct = (product, currentUserId) => {
  if (!product) return false;
  if (isOwnProduct(product, currentUserId)) return false;
  if (product.status !== "tersedia") return false;
  if (Number(product.quantity || 0) <= 0) return false;

  return true;
};

export const buildWhatsappUrl = ({
  phone,
  productName,
  buyerName,
  offerPrice,
}) => {
  let normalizedPhone = String(phone || "").replace(/[^\d]/g, "");

  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = `62${normalizedPhone.slice(1)}`;
  }

  if (!normalizedPhone) {
    return "#";
  }

  const message = encodeURIComponent(
    `Halo, saya ingin melanjutkan komunikasi terkait produk "${productName}" di SaveByUp. Pengajuan dari ${buyerName} dengan harga penawaran Rp${Number(
      offerPrice || 0
    ).toLocaleString("id-ID")} sudah disetujui.`
  );

  return `https://wa.me/${normalizedPhone}?text=${message}`;
};