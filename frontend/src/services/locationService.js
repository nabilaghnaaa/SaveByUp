const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 0,
};

export const isGeolocationSupported = () => {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
};

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(
        new Error(
          "Browser kamu belum mendukung GPS. Coba gunakan Chrome/Edge terbaru."
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude),
          longitude: Number(position.coords.longitude),
          accuracy: Number(position.coords.accuracy || 0),
        });
      },
      (error) => {
        let message = "Gagal mengambil lokasi GPS.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk memakai GPS.";
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Lokasi tidak tersedia. Pastikan GPS/perizinan lokasi perangkat aktif.";
        }

        if (error.code === error.TIMEOUT) {
          message =
            "Pengambilan lokasi terlalu lama. Coba lagi atau pindah ke area dengan sinyal lebih baik.";
        }

        reject(new Error(message));
      },
      GEOLOCATION_OPTIONS
    );
  });
};

export const isValidCoordinate = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

export const formatCoordinate = (value) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return "";

  return Number(numberValue.toFixed(8));
};

export const buildLocationLabel = ({ latitude, longitude, accuracy }) => {
  if (!isValidCoordinate(latitude, longitude)) return "";

  const accuracyText =
    accuracy && Number(accuracy) > 0 ? ` • akurasi ±${Math.round(accuracy)}m` : "";

  return `Titik GPS tersimpan (${formatCoordinate(latitude)}, ${formatCoordinate(
    longitude
  )})${accuracyText}`;
};

export const buildOpenStreetMapEmbedUrl = (latitude, longitude) => {
  if (!isValidCoordinate(latitude, longitude)) return "";

  const lat = Number(latitude);
  const lng = Number(longitude);
  const delta = 0.006;

  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
};

export const buildMapsUrl = (latitude, longitude) => {
  if (!isValidCoordinate(latitude, longitude)) return "";

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};