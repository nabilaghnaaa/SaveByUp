import { getDaysLeft } from "./formatDate";

export const FOOD_STATUS_OPTIONS = [
  {
    value: "aman",
    label: "Aman",
  },
  {
    value: "mendekati_kedaluwarsa",
    label: "Mendekati Kedaluwarsa",
  },
  {
    value: "kedaluwarsa",
    label: "Kedaluwarsa",
  },
  {
    value: "dijual",
    label: "Dijual",
  },
  {
    value: "terjual",
    label: "Terjual",
  },
  {
    value: "digunakan",
    label: "Sudah Digunakan",
  },
  {
    value: "dibuang",
    label: "Dibuang",
  },
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

export const MANUAL_FOOD_STATUSES = [
  "dijual",
  "terjual",
  "digunakan",
  "dibuang",
];

export const getRemainingDays = (expiryDate) => {
  if (!expiryDate) return null;

  const daysLeft = getDaysLeft(expiryDate);

  if (daysLeft === undefined || Number.isNaN(daysLeft)) {
    return null;
  }

  return daysLeft;
};

export const getFoodStatusLabel = (status) => {
  const selectedStatus = FOOD_STATUS_OPTIONS.find(
    (item) => item.value === status
  );

  return selectedStatus?.label || "Aman";
};

export const getAutoStatus = (expiryDate, currentStatus = "aman") => {
  if (MANUAL_FOOD_STATUSES.includes(currentStatus)) {
    return currentStatus;
  }

  const daysLeft = getRemainingDays(expiryDate);

  if (daysLeft === null) return "aman";
  if (daysLeft < 0) return "kedaluwarsa";
  if (daysLeft <= 7) return "mendekati_kedaluwarsa";

  return "aman";
};

/*
  Function ini dibuat fleksibel:
  - Bisa dipanggil getFoodStatus(form)
  - Bisa dipanggil getFoodStatus(expiryDate, status)
*/
export const getFoodStatus = (foodOrExpiryDate, currentStatus = "aman") => {
  if (
    foodOrExpiryDate &&
    typeof foodOrExpiryDate === "object" &&
    !Array.isArray(foodOrExpiryDate)
  ) {
    const food = foodOrExpiryDate;
    return getAutoStatus(food.expiry_date, food.status || "aman");
  }

  return getAutoStatus(foodOrExpiryDate, currentStatus);
};

/*
  Function ini juga fleksibel:
  - Bisa dipanggil getFoodPriority(form)
  - Bisa dipanggil getFoodPriority(expiryDate, status)
  Return tetap object agar cocok dengan kode lama kamu.
*/
export const getFoodPriority = (foodOrExpiryDate, statusParam = "aman") => {
  const expiryDate =
    foodOrExpiryDate &&
    typeof foodOrExpiryDate === "object" &&
    !Array.isArray(foodOrExpiryDate)
      ? foodOrExpiryDate.expiry_date
      : foodOrExpiryDate;

  const status =
    foodOrExpiryDate &&
    typeof foodOrExpiryDate === "object" &&
    !Array.isArray(foodOrExpiryDate)
      ? getFoodStatus(foodOrExpiryDate)
      : getFoodStatus(expiryDate, statusParam);

  if (status === "dibuang" || status === "kedaluwarsa") {
    return {
      value: "tidak_layak",
      label: "Tidak Layak",
      tone: "danger",
      message:
        "Makanan ini tidak direkomendasikan untuk dikonsumsi atau dijual.",
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

  if (status === "dijual") {
    return {
      value: "sedang",
      label: "Sedang Dijual",
      tone: "blue",
      message: "Makanan ini sedang ditawarkan di marketplace.",
    };
  }

  const daysLeft = getRemainingDays(expiryDate);

  if (daysLeft === null) {
    return {
      value: "belum_ada_tanggal",
      label: "Belum Ada Tanggal",
      tone: "gray",
      message:
        "Tambahkan tanggal kedaluwarsa agar sistem bisa memberi prioritas.",
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

export const getFoodPriorityLabel = (priority) => {
  if (!priority) return "Rendah";

  if (typeof priority === "object") {
    return priority.label || "Rendah";
  }

  const labels = {
    tinggi: "Prioritas Tinggi",
    sedang: "Prioritas Sedang",
    rendah: "Prioritas Rendah",
    tidak_layak: "Tidak Layak",
    selesai: "Selesai",
    belum_ada_tanggal: "Belum Ada Tanggal",
  };

  return labels[priority] || "Rendah";
};

export const getFoodPriorityValue = (priority) => {
  if (!priority) return "rendah";

  if (typeof priority === "object") {
    return priority.value || "rendah";
  }

  return priority;
};

export const getRemainingDaysLabel = (expiryDate) => {
  const daysLeft = getRemainingDays(expiryDate);

  if (daysLeft === null) return "Tanggal belum diisi";

  if (daysLeft < 0) {
    return `Lewat ${Math.abs(daysLeft)} hari`;
  }

  if (daysLeft === 0) {
    return "Hari ini";
  }

  return `${daysLeft} hari lagi`;
};

export const canSellFood = (food) => {
  const status = getFoodStatus(food);
  const daysLeft = getRemainingDays(food?.expiry_date);

  return (
    status !== "dibuang" &&
    status !== "digunakan" &&
    status !== "terjual" &&
    status !== "kedaluwarsa" &&
    daysLeft !== null &&
    daysLeft >= 0
  );
};

export const getStatusTone = (status) => {
  if (status === "kedaluwarsa" || status === "dibuang") return "danger";
  if (status === "mendekati_kedaluwarsa") return "warning";
  if (status === "dijual" || status === "terjual") return "blue";
  if (status === "digunakan") return "gray";

  return "green";
};

export const getFoodActionSuggestion = (food) => {
  const status = getFoodStatus(food);
  const priority = getFoodPriority(food);

  if (!food?.expiry_date) {
    return "Isi tanggal kedaluwarsa agar sistem bisa memberi rekomendasi.";
  }

  if (status === "kedaluwarsa") {
    return "Jangan langsung dijual. Cek kondisi makanan terlebih dahulu.";
  }

  if (status === "mendekati_kedaluwarsa") {
    return "Gunakan lebih dulu atau tawarkan ke marketplace jika masih layak.";
  }

  if (status === "dijual") {
    return "Pantau pengajuan pembelian dari marketplace.";
  }

  if (status === "terjual") {
    return "Pastikan transaksi sudah selesai dan beri rating jika diperlukan.";
  }

  if (status === "digunakan") {
    return "Data makanan sudah selesai diproses sebagai makanan yang digunakan.";
  }

  if (status === "dibuang") {
    return "Catat sebagai food waste agar data analitik tetap akurat.";
  }

  if (priority.value === "rendah") {
    return "Simpan dengan baik dan cek kembali saat mendekati tanggal kedaluwarsa.";
  }

  return priority.message;
};