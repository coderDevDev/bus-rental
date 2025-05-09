export const calculateTotalFare = (
  route: RouteWithLocations | undefined,
  passengers: Array<{ type: 'regular' | 'student' | 'senior' }>,
  fromStop: number,
  toStop: number
): number => {
  if (!route) return 0;

  const baseFare = calculateSegmentFare(route, fromStop, toStop);
  return passengers.reduce((total, passenger) => {
    return total + calculatePassengerFare(baseFare, passenger.type);
  }, 0);
};
