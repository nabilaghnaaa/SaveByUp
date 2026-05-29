const normalizeCoordinate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return null;

  return numberValue;
};

const isValidCoordinate = (latitude, longitude) => {
  const lat = normalizeCoordinate(latitude);
  const lng = normalizeCoordinate(longitude);

  if (lat === null || lng === null) return false;

  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const hasCoordinate = (latitude, longitude) => {
  return isValidCoordinate(latitude, longitude);
};

module.exports = {
  normalizeCoordinate,
  isValidCoordinate,
  hasCoordinate,
};