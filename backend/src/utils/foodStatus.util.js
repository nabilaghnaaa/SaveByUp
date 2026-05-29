const TERMINAL_FOOD_STATUS = [
  "digunakan",
  "dibuang",
  "terjual",
  "kedaluwarsa",
];

const PARTIAL_ACTION_STATUS = ["digunakan", "dibuang"];

const ALLOWED_FOOD_STATUS = [
  "aman",
  "mendekati_kedaluwarsa",
  "kedaluwarsa",
  "dijual",
  "terjual",
  "digunakan",
  "dibuang",
];

const mapStatusToCondition = (status) => {
  if (status === "aman") return "layak";
  if (status === "mendekati_kedaluwarsa") return "mendekati_kedaluwarsa";
  if (status === "kedaluwarsa") return "kedaluwarsa";

  return "layak";
};

const mapConditionToStatus = (conditionStatus) => {
  if (conditionStatus === "layak") return "aman";
  if (conditionStatus === "mendekati_kedaluwarsa") {
    return "mendekati_kedaluwarsa";
  }
  if (conditionStatus === "kedaluwarsa") return "kedaluwarsa";

  return "aman";
};

const calculateFoodStatus = (expiryDate, manualStatus = "") => {
  if (["dijual", "terjual", "digunakan", "dibuang"].includes(manualStatus)) {
    return {
      status: manualStatus,
      priority:
        manualStatus === "dibuang"
          ? "tidak_layak"
          : manualStatus === "digunakan" || manualStatus === "terjual"
            ? "selesai"
            : "sedang",
      condition_status: mapStatusToCondition(manualStatus),
    };
  }

  if (manualStatus === "kedaluwarsa") {
    return {
      status: "kedaluwarsa",
      priority: "tidak_layak",
      condition_status: "kedaluwarsa",
    };
  }

  if (!expiryDate) {
    return {
      status: "aman",
      priority: "rendah",
      condition_status: "layak",
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (Number.isNaN(diffDays)) {
    return {
      status: "aman",
      priority: "rendah",
      condition_status: "layak",
    };
  }

  if (diffDays < 0) {
    return {
      status: "kedaluwarsa",
      priority: "tidak_layak",
      condition_status: "kedaluwarsa",
    };
  }

  if (diffDays <= 3) {
    return {
      status: "mendekati_kedaluwarsa",
      priority: "tinggi",
      condition_status: "mendekati_kedaluwarsa",
    };
  }

  if (diffDays <= 7) {
    return {
      status: "mendekati_kedaluwarsa",
      priority: "sedang",
      condition_status: "mendekati_kedaluwarsa",
    };
  }

  return {
    status: "aman",
    priority: "rendah",
    condition_status: "layak",
  };
};

const getFoodConditionStatus = (food = {}) => {
  const calculated = calculateFoodStatus(food.expiry_date, "");

  return calculated;
};

const normalizeFood = (food = {}) => {
  const fallbackStatus =
    food.status || mapConditionToStatus(food.condition_status);

  const calculated = calculateFoodStatus(food.expiry_date, fallbackStatus);
  const conditionCalculated = getFoodConditionStatus(food);

  const activeMarketplaceQuantity = Number(
    food.active_marketplace_quantity || 0
  );

  const freeQuantity = Math.max(
    Number(food.quantity || 0) - activeMarketplaceQuantity,
    0
  );

  return {
    id: food.id,
    user_id: food.user_id,
    name: food.name || "",
    category: food.category || "",
    quantity: Number(food.quantity || 0),
    unit: food.unit || "pcs",
    price: Number(food.price || 0),
    storage_location: food.storage_location || "",
    purchase_date: food.purchase_date,
    expiry_date: food.expiry_date,

    condition_status:
      food.condition_status ||
      conditionCalculated.condition_status ||
      mapStatusToCondition(calculated.status),

    condition_label_status: conditionCalculated.status,
    condition_priority: conditionCalculated.priority,

    status: food.status || calculated.status,
    priority: food.priority || calculated.priority,

    active_marketplace_quantity: activeMarketplaceQuantity,
    available_marketplace_quantity: Number(
      food.available_marketplace_quantity || 0
    ),
    process_marketplace_quantity: Number(food.process_marketplace_quantity || 0),
    free_quantity: freeQuantity,

    note: food.note || food.notes || "",
    notes: food.notes || food.note || "",
    image_url: food.image_url || food.image || "",
    image: food.image || food.image_url || "",
    created_at: food.created_at,
    updated_at: food.updated_at,
  };
};

const validateFoodPayload = ({ name, quantity, unit, price, expiry_date }) => {
  if (!String(name || "").trim()) {
    return "Nama makanan wajib diisi";
  }

  if (!quantity || Number(quantity) <= 0) {
    return "Jumlah makanan harus lebih dari 0";
  }

  if (!String(unit || "").trim()) {
    return "Satuan wajib diisi";
  }

  if (!price || Number(price) <= 0) {
    return "Harga makanan wajib diisi dan harus lebih dari 0";
  }

  if (!expiry_date) {
    return "Tanggal kedaluwarsa wajib diisi";
  }

  const parsedDate = new Date(expiry_date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tanggal kedaluwarsa tidak valid";
  }

  return "";
};

module.exports = {
  TERMINAL_FOOD_STATUS,
  PARTIAL_ACTION_STATUS,
  ALLOWED_FOOD_STATUS,
  mapStatusToCondition,
  mapConditionToStatus,
  calculateFoodStatus,
  getFoodConditionStatus,
  normalizeFood,
  validateFoodPayload,
};