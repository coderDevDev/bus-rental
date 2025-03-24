-- Add indexes for frequently queried columns
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_from_location ON routes(from_location);
CREATE INDEX idx_routes_to_location ON routes(to_location);

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_route_id ON tickets(route_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_travel_date ON tickets(travel_date);

-- Add composite indexes for common queries
CREATE INDEX idx_routes_locations ON routes(from_location, to_location);
CREATE INDEX idx_tickets_user_status ON tickets(user_id, status); 