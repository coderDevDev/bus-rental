// Common types used across components
export interface Passenger {
  id: string;
  name: string;
  seatNumber: string;
  destination: string;
  ticketType: 'regular' | 'student' | 'senior';
}

export interface TicketHistoryItem {
  id: string;
  ticket_number: string;
  passenger_name: string;
  passenger_type: 'regular' | 'student' | 'senior';
  from_location: string;
  to_location: string;
  amount: number;
  status: string;
  created_at: string;
  cancelled_at?: string;
  completed_at?: string;
}

export interface DailySummaryProps {
  stats: {
    ticketsIssued: number;
    activeHours: number;
    revenue: number;
  };
  ticketBreakdown: {
    regular: number;
    student: number;
    senior: number;
  };
}

export interface QuickActionsProps {
  onIssueTicket: () => void;
  onScanTicket: () => void;
  onClockIn: () => void;
  onShowReport: () => void;
  isOnDuty: boolean;
}

export interface RouteProgressProps {
  currentAssignment: {
    route: {
      from_location: { city: string };
      to_location: { city: string };
    };
  } | null;
  currentLocation: {
    latitude: number;
    longitude: number;
    heading?: number;
  } | null;
}

export interface TicketManagementProps {
  tickets: TicketHistoryItem[];
  onViewTicket: (id: string) => void;
  onCancelTicket: (id: string) => void;
}

export interface PassengerListProps {
  passengers: Passenger[];
  onPassengerClick: (id: string) => void;
}

export interface DashboardState {
  ticketBreakdown: {
    regular: number;
    student: number;
    senior: number;
  };
  activePassengers: {
    id: string;
    name: string;
    seatNumber: string;
    destination: string;
    ticketType: 'regular' | 'student' | 'senior';
  }[];
  selectedTicket: TicketHistoryItem | null;
}
