import API from "./api";

const getFileUrl = (filePath = "") => {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const baseURL = API.defaults.baseURL || "http://localhost:5000/api";
  const appURL = baseURL.replace("/api", "");

  return `${appURL}${filePath}`;
};

const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeProfile = (profile = {}) => {
  const photoPath = profile.photo || profile.avatar_url || "";

  const latitude = toNullableNumber(profile.latitude);
  const longitude = toNullableNumber(profile.longitude);

  return {
    id: profile.id,
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    whatsapp: profile.whatsapp || "",
    address: profile.address || "",

    latitude,
    longitude,
    location_label: profile.location_label || "",
    location_updated_at: profile.location_updated_at || "",
    has_location: Boolean(profile.has_location || (latitude && longitude)),

    photo: photoPath,
    photo_url: getFileUrl(photoPath),
    avatar_url: photoPath,

    bio: profile.bio || "",
    rating: Number(profile.rating || 0),

    is_profile_complete: Boolean(profile.is_profile_complete),
    missing_fields: Array.isArray(profile.missing_fields)
      ? profile.missing_fields
      : [],
  };
};

export const getProfile = async () => {
  const response = await API.get("/profile");

  return normalizeProfile(response.data.data || {});
};

export const updateProfile = async (payload = {}) => {
  const formData = new FormData();

  formData.append("name", payload.name || "");
  formData.append("phone", payload.phone || "");
  formData.append("whatsapp", payload.whatsapp || "");
  formData.append("address", payload.address || "");
  formData.append("bio", payload.bio || "");

  formData.append(
    "latitude",
    payload.latitude !== null && payload.latitude !== undefined
      ? String(payload.latitude)
      : ""
  );

  formData.append(
    "longitude",
    payload.longitude !== null && payload.longitude !== undefined
      ? String(payload.longitude)
      : ""
  );

  formData.append("location_label", payload.location_label || "");

  if (payload.photoFile) {
    formData.append("photo", payload.photoFile);
  }

  const response = await API.put("/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    ...response.data,
    data: normalizeProfile(response.data.data || {}),
  };
};

export const isProfileComplete = (profile = {}) => {
  return Boolean(
    String(profile.name || "").trim() &&
      String(profile.email || "").trim() &&
      String(profile.whatsapp || "").trim() &&
      String(profile.address || "").trim()
  );
};

export const getMissingProfileFields = (profile = {}) => {
  const missing = [];

  if (!String(profile.name || "").trim()) missing.push("Nama");
  if (!String(profile.email || "").trim()) missing.push("Email");
  if (!String(profile.whatsapp || "").trim()) missing.push("WhatsApp");
  if (!String(profile.address || "").trim()) missing.push("Area COD");

  return missing;
};