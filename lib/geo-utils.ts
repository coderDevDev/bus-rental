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

/**
 * Calculate distance between two points in kilometers using the Haversine formula
 */
export function calculateDistanceBetweenPoints(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLng1 = (Math.PI * lng1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radLng2 = (Math.PI * lng2) / 180;

  // Haversine formula
  const dLat = radLat2 - radLat1;
  const dLng = radLng2 - radLng1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Earth's radius in kilometers
  const R = 6371;

  // Calculate the distance
  return R * c;
}

/**
 * Determine if a point is near a route (within a certain radius)
 */
export function isPointNearRoute(
  routePoints: Array<[number, number]>,
  point: [number, number],
  maxDistanceKm: number = 0.5
): boolean {
  // For each segment of the route, check if point is close enough
  for (let i = 0; i < routePoints.length - 1; i++) {
    const isNear = isPointNearLineSegment(
      routePoints[i][0],
      routePoints[i][1],
      routePoints[i + 1][0],
      routePoints[i + 1][1],
      point[0],
      point[1],
      maxDistanceKm
    );
    if (isNear) return true;
  }
  return false;
}

/**
 * Check if a point is near a line segment
 */
function isPointNearLineSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  px: number,
  py: number,
  maxDistanceKm: number
): boolean {
  const distance = pointToLineDistance(x1, y1, x2, y2, px, py);
  return distance <= maxDistanceKm;
}

/**
 * Calculate the distance from a point to a line segment
 */
function pointToLineDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  px: number,
  py: number
): number {
  // Convert to kilometers using Haversine approximation
  const dist1 = calculateDistanceBetweenPoints(y1, x1, py, px);
  const dist2 = calculateDistanceBetweenPoints(y2, x2, py, px);
  const lineLength = calculateDistanceBetweenPoints(y1, x1, y2, x2);

  if (lineLength === 0) return dist1;

  // Calculate the perpendicular distance using the formula
  const t =
    ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength * lineLength);

  if (t < 0) return dist1;
  if (t > 1) return dist2;

  // Perpendicular projection falls on the line segment
  const projectionX = x1 + t * (x2 - x1);
  const projectionY = y1 + t * (y2 - y1);

  return calculateDistanceBetweenPoints(py, px, projectionY, projectionX);
}
