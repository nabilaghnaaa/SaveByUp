import API from "./api";

const normalizeProfile = (profile = {}) => ({
  id: profile.id,
  name: profile.name || "",
  email: profile.email || "",
  whatsapp: profile.whatsapp || "",
  address: profile.address || "",
  avatar_url: profile.avatar_url || "",
  rating: Number(profile.rating || 0),
});

export const getProfile = async () => {
  const response = await API.get("/profile");
  return normalizeProfile(response.data.data);
};

export const updateProfile = async (payload) => {
  const response = await API.put("/profile", {
    name: payload.name,
    whatsapp: payload.whatsapp || "",
    address: payload.address || "",
    avatar_url: payload.avatar_url || "",
  });

  return response.data;
};