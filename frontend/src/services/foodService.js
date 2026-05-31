import API from "./api";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeDate = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const normalizeFood = (food = {}) => {
  const quantity = toNumber(food.quantity);

  const activeMarketplaceQuantity = toNumber(
    food.active_marketplace_quantity
  );

  const availableMarketplaceQuantity = toNumber(
    food.available_marketplace_quantity
  );

  const processMarketplaceQuantity = toNumber(
    food.process_marketplace_quantity
  );

  const freeQuantity =
    food.free_quantity !== undefined && food.free_quantity !== null
      ? toNumber(food.free_quantity)
      : Math.max(quantity - activeMarketplaceQuantity, 0);

  return {
    id: food.id,
    user_id: food.user_id,

    name: food.name || "",
    category: food.category || "",

    quantity,
    unit: food.unit || "pcs",
    price: toNumber(food.price),

    storage_location: food.storage_location || "",

    purchase_date: normalizeDate(food.purchase_date),
    expiry_date: normalizeDate(food.expiry_date),

    condition_status: food.condition_status || "",
    condition_label_status: food.condition_label_status || "",
    condition_priority: food.condition_priority || "",

    status: food.status || "aman",
    priority: food.priority || "rendah",

    active_marketplace_quantity: activeMarketplaceQuantity,
    available_marketplace_quantity: availableMarketplaceQuantity,
    process_marketplace_quantity: processMarketplaceQuantity,
    free_quantity: freeQuantity,

    note: food.note || food.notes || "",
    notes: food.notes || food.note || "",

    image_url: food.image_url || food.image || "",
    image: food.image || food.image_url || "",

    created_at: food.created_at,
    updated_at: food.updated_at,
  };
};

const normalizeSummary = (data = {}) => {
  const totalStok = toNumber(data.total_stok || data.total_foods);
  const totalDijual = toNumber(data.total_dijual);
  const totalDigunakan = toNumber(data.total_digunakan);
  const totalDibuang = toNumber(data.total_dibuang);
  const totalTerjual = toNumber(data.total_terjual);
  const totalKedaluwarsa = toNumber(data.total_kedaluwarsa);

  return {
    total_items: toNumber(data.total_items),

    total_foods: toNumber(data.total_foods),
    total_stok: totalStok,

    total_aman: toNumber(data.total_aman),
    total_mendekati: toNumber(data.total_mendekati),
    total_kedaluwarsa: totalKedaluwarsa,

    total_dijual: totalDijual,
    total_dijual_tersedia: toNumber(data.total_dijual_tersedia),
    total_dalam_proses: toNumber(data.total_dalam_proses),

    total_digunakan: totalDigunakan,
    total_dibuang: totalDibuang,
    total_terjual: totalTerjual,

    total_selesai_waste:
      data.total_selesai_waste !== undefined &&
      data.total_selesai_waste !== null
        ? toNumber(data.total_selesai_waste)
        : totalDigunakan + totalDibuang + totalTerjual + totalKedaluwarsa,

    total_prioritas_tinggi: toNumber(data.total_prioritas_tinggi),
    total_prioritas_sedang: toNumber(data.total_prioritas_sedang),
    total_prioritas_rendah: toNumber(data.total_prioritas_rendah),
  };
};

const toFoodPayload = (food = {}) => ({
  name: food.name || "",
  category: food.category || "",

  quantity: toNumber(food.quantity),
  unit: food.unit || "pcs",
  price: toNumber(food.price),

  storage_location: food.storage_location || "",

  purchase_date: food.purchase_date || null,
  expiry_date: food.expiry_date || "",

  note: food.note || food.notes || "",
  notes: food.notes || food.note || "",

  image_url: food.image_url || food.image || "",
  image: food.image || food.image_url || "",

  status: food.status || "aman",
});

export const getFoodSummary = async () => {
  const response = await API.get("/foods/summary");
  return normalizeSummary(response.data.data || {});
};

export const getFoods = async () => {
  const response = await API.get("/foods");
  const foods = response.data.data || [];

  return Array.isArray(foods) ? foods.map(normalizeFood) : [];
};

export const getFoodById = async (id) => {
  const response = await API.get(`/foods/${id}`);
  return normalizeFood(response.data.data || {});
};

export const createFood = async (food) => {
  const response = await API.post("/foods", toFoodPayload(food));
  return response.data;
};

export const updateFood = async (id, food) => {
  const response = await API.put(`/foods/${id}`, toFoodPayload(food));
  return response.data;
};

export const updateFoodStatus = async (food, status, quantity = null) => {
  const payload = {
    status,
  };

  if (quantity !== null && quantity !== undefined && quantity !== "") {
    payload.quantity = toNumber(quantity);
  }

  const response = await API.patch(`/foods/${food.id}/status`, payload);
  return response.data;
};

export const useFoodStock = async (food, quantity) => {
  return updateFoodStatus(food, "digunakan", quantity);
};

export const throwFoodStock = async (food, quantity) => {
  return updateFoodStatus(food, "dibuang", quantity);
};

export const deleteFood = async (id) => {
  const response = await API.delete(`/foods/${id}`);
  return response.data;
};