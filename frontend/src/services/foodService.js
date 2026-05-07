import API from './api';

export const getFoodSummary = async () => {
  const response = await API.get('/foods/summary');
  const data = response.data.data || {};

  return {
    total_foods: Number(data.total_foods || 0),
    total_aman: Number(data.total_aman || 0),
    total_mendekati: Number(data.total_mendekati || 0),
    total_kedaluwarsa: Number(data.total_kedaluwarsa || 0),
    total_dibuang: Number(data.total_dibuang || 0),
    total_digunakan: Number(data.total_digunakan || 0),
    total_prioritas_tinggi: Number(data.total_prioritas_tinggi || 0),
    total_prioritas_sedang: Number(data.total_prioritas_sedang || 0),
    total_prioritas_rendah: Number(data.total_prioritas_rendah || 0),
  };
};

export const getFoods = async () => {
  const response = await API.get('/foods');

  return response.data.data || [];
};

export const deleteFood = async (id) => {
  const response = await API.delete(`/foods/${id}`);

  return response.data;
};

export const updateFoodStatus = async (food, status) => {
  const response = await API.put(`/foods/${food.id}`, {
    name: food.name,
    category: food.category,
    quantity: food.quantity,
    unit: food.unit,
    expiry_date: food.expiry_date,
    status,
  });

  return response.data;
};