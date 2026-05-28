import API from "./api";

const normalizeFood = (food = {}) => ({
  id: food.id,
  user_id: food.user_id,
  name: food.name || "",
  category: food.category || "",
  quantity: Number(food.quantity || 0),
  unit: food.unit || "pcs",
  price: Number(food.price || 0),
  storage_location: food.storage_location || "",
  purchase_date: food.purchase_date
    ? String(food.purchase_date).slice(0, 10)
    : "",
  expiry_date: food.expiry_date ? String(food.expiry_date).slice(0, 10) : "",
  condition_status: food.condition_status || "",
  status: food.status || "aman",
  priority: food.priority || "rendah",
  note: food.note || food.notes || "",
  notes: food.notes || food.note || "",
  image_url: food.image_url || food.image || "",
  image: food.image || food.image_url || "",
  created_at: food.created_at,
  updated_at: food.updated_at,
});

const normalizeSummary = (data = {}) => ({
  total_foods: Number(data.total_foods || 0),
  total_aman: Number(data.total_aman || 0),
  total_mendekati: Number(data.total_mendekati || 0),
  total_kedaluwarsa: Number(data.total_kedaluwarsa || 0),
  total_dibuang: Number(data.total_dibuang || 0),
  total_digunakan: Number(data.total_digunakan || 0),
  total_dijual: Number(data.total_dijual || 0),
  total_terjual: Number(data.total_terjual || 0),
  total_prioritas_tinggi: Number(data.total_prioritas_tinggi || 0),
  total_prioritas_sedang: Number(data.total_prioritas_sedang || 0),
  total_prioritas_rendah: Number(data.total_prioritas_rendah || 0),
});

const toFoodPayload = (food = {}) => ({
  name: food.name,
  category: food.category,
  quantity: Number(food.quantity || 0),
  unit: food.unit || "pcs",
  price: Number(food.price || 0),
  storage_location: food.storage_location || "",
  purchase_date: food.purchase_date || null,
  expiry_date: food.expiry_date,
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
  return normalizeFood(response.data.data);
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
    payload.quantity = Number(quantity);
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