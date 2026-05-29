const {
  getFoodConditionStatus,
  normalizeFood,
} = require("../utils/foodStatus.util");

const {
  getMarketplaceSummaryBySeller,
} = require("./foodMarketplace.service");

const {
  getStockLogTotalsByUser,
  getCompletedTransactionStockBySeller,
} = require("./foodStockLog.service");

const sumBy = (items = [], callback) => {
  return items.reduce((total, item) => total + Number(callback(item) || 0), 0);
};

const buildSummaryFromFoods = async (foods = [], userId) => {
  const normalizedFoods = foods.map(normalizeFood);

  const totalItems = normalizedFoods.length;
  const totalCurrentStock = sumBy(normalizedFoods, (food) => food.quantity);

  const totalAman = sumBy(normalizedFoods, (food) => {
    const condition = getFoodConditionStatus(food);
    return condition.status === "aman" ? food.quantity : 0;
  });

  const totalMendekati = sumBy(normalizedFoods, (food) => {
    const condition = getFoodConditionStatus(food);
    return condition.status === "mendekati_kedaluwarsa" ? food.quantity : 0;
  });

  const totalKedaluwarsa = sumBy(normalizedFoods, (food) => {
    const condition = getFoodConditionStatus(food);
    return condition.status === "kedaluwarsa" ? food.quantity : 0;
  });

  const totalPrioritasTinggi = sumBy(normalizedFoods, (food) => {
    const condition = getFoodConditionStatus(food);
    return condition.priority === "tinggi" ? food.quantity : 0;
  });

  const totalPrioritasSedang = sumBy(normalizedFoods, (food) => {
    const condition = getFoodConditionStatus(food);
    return condition.priority === "sedang" ? food.quantity : 0;
  });

  const totalPrioritasRendah = sumBy(normalizedFoods, (food) => {
    const condition = getFoodConditionStatus(food);
    return condition.priority === "rendah" ? food.quantity : 0;
  });

  const marketplaceSummary = await getMarketplaceSummaryBySeller(userId);
  const stockLogTotals = await getStockLogTotalsByUser(userId);
  const transactionTerjual = await getCompletedTransactionStockBySeller(userId);

  const totalTerjual =
    stockLogTotals.total_terjual_log > 0
      ? stockLogTotals.total_terjual_log
      : transactionTerjual;

  return {
    total_items: totalItems,

    // Dipakai frontend lama agar tidak error, tapi sekarang artinya total stok aktif.
    total_foods: totalCurrentStock,
    total_stok: totalCurrentStock,

    total_aman: totalAman,
    total_mendekati: totalMendekati,
    total_kedaluwarsa: totalKedaluwarsa,

    total_dijual: marketplaceSummary.total_dijual,
    total_dijual_tersedia: marketplaceSummary.total_dijual_tersedia,
    total_dalam_proses: marketplaceSummary.total_dalam_proses,

    total_digunakan: stockLogTotals.total_digunakan,
    total_dibuang: stockLogTotals.total_dibuang,
    total_terjual: totalTerjual,

    total_selesai_waste:
      stockLogTotals.total_digunakan +
      stockLogTotals.total_dibuang +
      totalTerjual +
      totalKedaluwarsa,

    total_prioritas_tinggi: totalPrioritasTinggi,
    total_prioritas_sedang: totalPrioritasSedang,
    total_prioritas_rendah: totalPrioritasRendah,
  };
};

module.exports = {
  buildSummaryFromFoods,
};