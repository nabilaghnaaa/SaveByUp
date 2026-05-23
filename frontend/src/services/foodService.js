import API from "./api";

const normalizeFood = (food) => ({
  id: food.id || food.id_makanan,
  name: food.name || food.nama_makanan || "",
  category: food.category || food.kategori || "",
  quantity: Number(food.quantity ?? food.jumlah_stok ?? 0),
  unit: food.unit || food.satuan || "pcs",
  expiry_date: food.expiry_date || food.tanggal_kedaluwarsa || "",
  note: food.note || food.keterangan || "",
  status: food.status || food.status_makanan || "aman",
  priority: food.priority || food.prioritas || "",
  image_url: food.image_url || food.foto_makanan || food.photo_url || "",
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
  total_prioritas_tinggi: Number(data.total_prioritas_tinggi || 0),
  total_prioritas_sedang: Number(data.total_prioritas_sedang || 0),
  total_prioritas_rendah: Number(data.total_prioritas_rendah || 0),
});

const toFoodPayload = (food) => ({
  name: food.name,
  category: food.category,
  quantity: Number(food.quantity || 0),
  unit: food.unit,
  expiry_date: food.expiry_date,
  note: food.note || "",
  image_url: food.image_url || "",
  status: food.status || "aman",
});

export const getFoodSummary = async () => {
  const response = await API.get("/foods/summary");
  return normalizeSummary(response.data.data || response.data || {});
};

export const getFoods = async () => {
  const response = await API.get("/foods");
  const foods = response.data.data || response.data || [];
  return Array.isArray(foods) ? foods.map(normalizeFood) : [];
};

export const getFoodById = async (id) => {
  const response = await API.get(`/foods/${id}`);
  const food = response.data.data || response.data;
  return normalizeFood(food);
};

export const createFood = async (food) => {
  const response = await API.post("/foods", toFoodPayload(food));
  return response.data;
};

export const updateFood = async (id, food) => {
  const response = await API.put(`/foods/${id}`, toFoodPayload(food));
  return response.data;
};

export const deleteFood = async (id) => {
  const response = await API.delete(`/foods/${id}`);
  return response.data;
};

export const updateFoodStatus = async (food, status) => {
  const payload = toFoodPayload({
    ...food,
    status,
  });

  const response = await API.put(`/foods/${food.id}`, payload);
  return response.data;
};