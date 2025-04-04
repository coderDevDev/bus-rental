interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistance(
  start: Coordinates,
  end: Coordinates
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(end.latitude - start.latitude);
  const dLon = toRad(end.longitude - start.longitude);
  const lat1 = toRad(start.latitude);
  const lat2 = toRad(end.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateETA(
  distance: number,
  speed: number = 40 // Default average speed in km/h
): number {
  return (distance / speed) * 60; // Returns minutes
}

export function isNearLocation(
  current: Coordinates,
  target: Coordinates,
  threshold: number = 0.5 // Default 500m threshold
): boolean {
  const distance = calculateDistance(current, target);
  return distance <= threshold;
}
