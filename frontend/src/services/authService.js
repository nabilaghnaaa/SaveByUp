import API from "./api";

const normalizeUser = (user = {}) => ({
  id: user.id || user.user_id || user.id_user || "",
  name: user.name || user.nama || "",
  email: user.email || "",
  whatsapp: user.whatsapp || user.no_whatsapp || "",
  address: user.address || user.alamat || user.alamat_kos || "",
  avatar_url: user.avatar_url || "",
  rating: Number(user.rating || 0),
});

export const loginUser = async (payload) => {
  const response = await API.post("/auth/login", {
    email: payload.email,
    password: payload.password,
  });

  const data = response.data || {};
  const token = data.token || data.accessToken || data.data?.token;
  const user = normalizeUser(data.user || data.data?.user || data.data || {});

  if (token) {
    localStorage.setItem("token", token);
  }

  localStorage.setItem("user", JSON.stringify(user));

  return {
    token,
    user,
    message: data.message || "Login berhasil",
  };
};

export const registerUser = async (payload) => {
  const response = await API.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    whatsapp: payload.whatsapp || "",
    address: payload.address || "",
  });

  return response.data;
};

export const logoutUser = async () => {
  try {
    await API.post("/auth/logout");
  } catch (error) {
    console.warn("Logout API gagal atau belum tersedia:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user") || "{}");
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};