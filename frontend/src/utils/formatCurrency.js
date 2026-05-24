export const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

export const parseCurrencyNumber = (value) => {
  if (!value) return 0;

  return Number(String(value).replace(/[^\d]/g, ""));
};