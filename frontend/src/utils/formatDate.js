export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getDaysLeft = (dateString) => {
  if (!dateString) return null;

  const today = new Date();
  const expiry = new Date(dateString);

  if (Number.isNaN(expiry.getTime())) {
    return null;
  }

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export const getDaysLeftLabel = (dateString) => {
  const daysLeft = getDaysLeft(dateString);

  if (daysLeft === null) return "Tanggal belum diisi";
  if (daysLeft < 0) return `Lewat ${Math.abs(daysLeft)} hari`;
  if (daysLeft === 0) return "Hari ini";
  return `${daysLeft} hari lagi`;
};