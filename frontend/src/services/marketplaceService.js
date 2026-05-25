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
  quantity: Number(product.quantity || 0),
  unit: product.unit || "pcs",
  price: Number(product.price || 0),
  expiry_date: product.expiry_date ? String(product.expiry_date).slice(0, 10) : "",
  image_url: product.image_url || product.image || "",
  status: product.status || "tersedia",
  created_at: product.created_at,
  updated_at: product.updated_at,
});

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
  offer_price: Number(request.offer_price || 0),
  note: request.note || "",
  status: request.status || "menunggu",
  created_at: request.created_at,
  responded_at: request.responded_at,
});

export const getMarketplaceProducts = async () => {
  const response = await API.get("/marketplace");
  const products = response.data.data || response.data || [];

  return Array.isArray(products) ? products.map(normalizeProduct) : [];
};

export const getMarketplaceProductById = async (id) => {
  const response = await API.get(`/marketplace/${id}`);
  return normalizeProduct(response.data.data || response.data);
};

export const createMarketplaceProduct = async (foodId, payload) => {
  const response = await API.post(`/marketplace/sell/${foodId}`, {
    price: Number(payload.price || 0),
    description: payload.description || "",
  });

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
    return [];
  }
};

export const getMyRequests = async () => {
  try {
    const response = await API.get("/requests/mine");
    const requests = response.data.data || response.data || [];

    return Array.isArray(requests) ? requests.map(normalizeRequest) : [];
  } catch (error) {
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