-- Add bus_locations table for real-time tracking
CREATE TABLE bus_locations (
  id UUID PRIMARY KEY REFERENCES buses(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_stop UUID REFERENCES locations(id),
  estimated_arrival TIMESTAMP WITH TIME ZONE
);

-- Add digital_tickets table
CREATE TABLE digital_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id),
  qr_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add bus_stops table
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  location_id UUID REFERENCES locations(id),
  stop_order INTEGER NOT NULL,
  estimated_duration INTEGER, -- minutes from start
  UNIQUE(route_id, stop_order)
); 