-- Add assignments table to link conductors, buses, and routes
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conductor_id UUID REFERENCES conductors(id),
  bus_id UUID REFERENCES buses(id),
  route_id UUID REFERENCES routes(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add passenger_bookings table for seat reservations
CREATE TABLE passenger_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id),
  user_id UUID REFERENCES auth.users(id),
  seat_number INTEGER NOT NULL,
  boarding_stop UUID REFERENCES locations(id),
  dropoff_stop UUID REFERENCES locations(id),
  status VARCHAR(20) CHECK (status IN ('booked', 'boarded', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add payment_transactions table for digital payments
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'ewallet')),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  reference_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add bus_tracking table for real-time location updates
CREATE TABLE bus_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID REFERENCES buses(id),
  assignment_id UUID REFERENCES assignments(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add bus_stops table for route stops
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  location_id UUID REFERENCES locations(id),
  stop_order INTEGER NOT NULL,
  estimated_duration INTEGER, -- minutes from start
  UNIQUE(route_id, stop_order)
);

-- Add notifications table for passenger alerts
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 