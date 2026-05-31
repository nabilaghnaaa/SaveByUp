const normalizeCoordinate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return null;

  return numberValue;
};

const isValidLatitude = (latitude) => {
  const lat = normalizeCoordinate(latitude);
  return lat !== null && lat >= -90 && lat <= 90;
};

const isValidLongitude = (longitude) => {
  const lng = normalizeCoordinate(longitude);
  return lng !== null && lng >= -180 && lng <= 180;
};

const isValidCoordinate = (latitude, longitude) => {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
};

const hasCoordinate = (latitude, longitude) => {
  return isValidCoordinate(latitude, longitude);
};

const roundCoordinate = (value, digits = 8) => {
  const coordinate = normalizeCoordinate(value);

  if (coordinate === null) return null;

  return Number(coordinate.toFixed(digits));
};

module.exports = {
  normalizeCoordinate,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinate,
  hasCoordinate,
  roundCoordinate,
};