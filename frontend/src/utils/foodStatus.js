import { getDaysLeft } from "./formatDate";

export const FOOD_STATUS_OPTIONS = [
  { value: "aman", label: "Aman" },
  { value: "mendekati_kedaluwarsa", label: "Mendekati Kedaluwarsa" },
  { value: "kedaluwarsa", label: "Kedaluwarsa" },
  { value: "dijual", label: "Dijual" },
  { value: "terjual", label: "Terjual" },
  { value: "digunakan", label: "Sudah Digunakan" },
  { value: "dibuang", label: "Dibuang" },
];

export const FOOD_CATEGORY_OPTIONS = [
  "Snack",
  "Makanan Instan",
  "Minuman",
  "Bahan Masak",
  "Buah",
  "Sayur",
  "Makanan Beku",
  "Lainnya",
];

export const FOOD_UNIT_OPTIONS = [
  "pcs",
  "bungkus",
  "botol",
  "kaleng",
  "gram",
  "kg",
  "porsi",
  "liter",
];

export const getFoodStatusLabel = (status) => {
  const match = FOOD_STATUS_OPTIONS.find((item) => item.value === status);
  return match?.label || "Aman";
};

export const getFoodPriority = (expiryDate, status = "aman") => {
  if (status === "dibuang" || status === "kedaluwarsa") {
    return {
      value: "tidak_layak",
      label: "Tidak Layak",
      tone: "danger",
      message: "Makanan ini tidak direkomendasikan untuk dikonsumsi atau dijual.",
    };
  }

  if (status === "digunakan" || status === "terjual") {
    return {
      value: "selesai",
      label: "Selesai",
      tone: "blue",
      message: "Makanan ini sudah selesai diproses.",
    };
  }

  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === null) {
    return {
      value: "rendah",
      label: "Belum Ada Tanggal",
      tone: "gray",
      message: "Tambahkan tanggal kedaluwarsa agar sistem bisa memberi prioritas.",
    };
  }

  if (daysLeft < 0) {
    return {
      value: "tidak_layak",
      label: "Kedaluwarsa",
      tone: "danger",
      message: "Makanan sudah melewati tanggal kedaluwarsa.",
    };
  }

  if (daysLeft <= 3) {
    return {
      value: "tinggi",
      label: "Prioritas Tinggi",
      tone: "danger",
      message: "Segera konsumsi atau manfaatkan sebelum terbuang.",
    };
  }

  if (daysLeft <= 7) {
    return {
      value: "sedang",
      label: "Prioritas Sedang",
      tone: "warning",
      message: "Makanan mulai mendekati kedaluwarsa.",
    };
  }

  return {
    value: "rendah",
    label: "Prioritas Rendah",
    tone: "green",
    message: "Makanan masih aman dan belum mendesak.",
  };
};

export const getAutoStatus = (expiryDate, currentStatus = "aman") => {
  if (["dijual", "terjual", "digunakan", "dibuang"].includes(currentStatus)) {
    return currentStatus;
  }

  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === null) return "aman";
  if (daysLeft < 0) return "kedaluwarsa";
  if (daysLeft <= 7) return "mendekati_kedaluwarsa";

  return "aman";
};

export const canSellFood = (food) => {
  const daysLeft = getDaysLeft(food.expiry_date);

  return (
    food.status !== "dibuang" &&
    food.status !== "digunakan" &&
    food.status !== "terjual" &&
    daysLeft !== null &&
    daysLeft >= 0
  );
};