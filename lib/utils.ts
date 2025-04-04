import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(distance: number): string {
  return `${distance.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function calculateTotalFare(
  route: Route | null,
  passengers: Array<{ type: string }>
): number {
  if (!route) return 0;

  return passengers.reduce((total, passenger) => {
    let fare = route.base_fare;

    // Apply discounts based on passenger type
    switch (passenger.type) {
      case 'student':
        fare *= 0.8; // 20% discount
        break;
      case 'senior':
        fare *= 0.7; // 30% discount
        break;
    }

    return total + fare;
  }, 0);
}

export function calculatePassengerFare(
  baseFare: number,
  passengerType: 'regular' | 'student' | 'senior'
): number {
  switch (passengerType) {
    case 'student':
      return baseFare * 0.8; // 20% discount
    case 'senior':
      return baseFare * 0.7; // 30% discount
    default:
      return baseFare;
  }
}
