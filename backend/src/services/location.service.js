const {
  normalizeCoordinate,
  hasCoordinate,
  roundCoordinate,
} = require("../utils/location.util");

const EARTH_RADIUS_KM = 6371;

const toRadians = (degree) => {
  return (Number(degree) * Math.PI) / 180;
};

const calculateDistanceKm = ({
  fromLatitude,
  fromLongitude,
  toLatitude,
  toLongitude,
}) => {
  if (!hasCoordinate(fromLatitude, fromLongitude)) return null;
  if (!hasCoordinate(toLatitude, toLongitude)) return null;

  const lat1 = normalizeCoordinate(fromLatitude);
  const lon1 = normalizeCoordinate(fromLongitude);
  const lat2 = normalizeCoordinate(toLatitude);
  const lon2 = normalizeCoordinate(toLongitude);

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(2));
};

const formatDistanceLabel = (distanceKm) => {
  const distance = Number(distanceKm);

  if (!Number.isFinite(distance)) {
    return "Jarak belum tersedia";
  }

  if (distance < 1) {
    return `± ${Math.round(distance * 1000)} m`;
  }

  return `± ${distance.toFixed(1)} km`;
};

const buildPublicLocation = ({
  latitude,
  longitude,
  locationLabel,
  address,
  distanceKm,
}) => {
  return {
    has_location: hasCoordinate(latitude, longitude),
    location_label: locationLabel || address || "Area COD belum diisi",
    distance_km:
      distanceKm === null || distanceKm === undefined
        ? null
        : Number(distanceKm),
    distance_label: formatDistanceLabel(distanceKm),
  };
};

const buildExactLocation = ({
  latitude,
  longitude,
  locationLabel,
  address,
  whatsapp,
  name,
}) => {
  const lat = roundCoordinate(latitude);
  const lng = roundCoordinate(longitude);

  return {
    name: name || "",
    whatsapp: whatsapp || "",
    address: address || "",
    location_label: locationLabel || address || "",
    latitude: lat,
    longitude: lng,
    has_location: hasCoordinate(lat, lng),
    maps_url:
      hasCoordinate(lat, lng) === true
        ? `https://www.google.com/maps?q=${lat},${lng}`
        : "",
  };
};

const maskLocation = (location = {}) => {
  return {
    ...location,
    latitude: null,
    longitude: null,
    maps_url: "",
    has_location: false,
  };
};

const canRevealTransactionLocation = (transaction = {}) => {
  return Number(transaction.location_revealed || 0) === 1;
};

const buildTransactionLocations = (transaction = {}) => {
  const canReveal = canRevealTransactionLocation(transaction);

  const buyerLocation = buildExactLocation({
    latitude: transaction.buyer_latitude,
    longitude: transaction.buyer_longitude,
    locationLabel: transaction.buyer_location_label,
    address: transaction.buyer_address,
    whatsapp: transaction.buyer_whatsapp,
    name: transaction.buyer_name,
  });

  const sellerLocation = buildExactLocation({
    latitude: transaction.seller_latitude,
    longitude: transaction.seller_longitude,
    locationLabel: transaction.seller_location_label,
    address: transaction.seller_address,
    whatsapp: transaction.seller_whatsapp,
    name: transaction.seller_name,
  });

  return {
    exact_location_available: canReveal,
    buyer_location: canReveal ? buyerLocation : maskLocation(buyerLocation),
    seller_location: canReveal ? sellerLocation : maskLocation(sellerLocation),
  };
};

module.exports = {
  calculateDistanceKm,
  formatDistanceLabel,
  buildPublicLocation,
  buildExactLocation,
  maskLocation,
  canRevealTransactionLocation,
  buildTransactionLocations,
};