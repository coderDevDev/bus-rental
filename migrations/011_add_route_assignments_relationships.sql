-- Add route_id foreign key to assignments table if not exists
ALTER TABLE assignments
ADD CONSTRAINT fk_assignments_route
FOREIGN KEY (route_id) REFERENCES routes(id);

-- Add indexes for better query performance
CREATE INDEX idx_assignments_route_id ON assignments(route_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_routes_status ON routes(status);

-- Add route schedules table for regular schedules
CREATE TABLE route_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  days_of_week TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add route_stops for intermediate stops
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  location_id UUID REFERENCES locations(id),
  stop_order INTEGER NOT NULL,
  arrival_offset INTEGER NOT NULL, -- minutes from start
  departure_offset INTEGER NOT NULL, -- minutes from start
  UNIQUE(route_id, stop_order)
); 