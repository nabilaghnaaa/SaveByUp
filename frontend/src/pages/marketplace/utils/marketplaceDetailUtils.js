export function getProductStatusLabel(status) {
  const labels = {
    tersedia: "Tersedia",
    dalam_proses: "Dalam Proses",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
    tidak_tersedia: "Tidak Tersedia",
  };

  return labels[status] || "Tersedia";
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getDistanceLabel(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || distanceKm === "") {
    return "Jarak belum tersedia";
  }

  const value = Number(distanceKm);

  if (!Number.isFinite(value)) {
    return "Jarak belum tersedia";
  }

  if (value < 0.1) {
    return "< 100 m dari kamu";
  }

  if (value < 1) {
    return `${Math.round(value * 1000)} m dari kamu`;
  }

  return `${value.toFixed(1)} km dari kamu`;
}

export function getDistanceTone(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || distanceKm === "") {
    return "unknown";
  }

  const value = Number(distanceKm);

  if (!Number.isFinite(value)) return "unknown";
  if (value <= 1) return "near";
  if (value <= 3) return "medium";

  return "far";
}

export function getStatusProgress(status) {
  if (status === "tersedia") return 100;
  if (status === "dalam_proses") return 62;
  if (status === "selesai") return 100;
  if (status === "dibatalkan") return 100;

  return 35;
}