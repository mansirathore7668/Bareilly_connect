export function getCoordinates(latitude, longitude) {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (
    Number.isFinite(parsedLatitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90 &&
    Number.isFinite(parsedLongitude) &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180
  ) {
    return [parsedLatitude, parsedLongitude];
  }

  return null;
}