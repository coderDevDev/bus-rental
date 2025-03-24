-- Drop the old bus_tracking table if it exists
DROP TABLE IF EXISTS bus_tracking;

-- Create the new bus_tracking table with proper relationships
CREATE TABLE bus_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID REFERENCES buses(id) NOT NULL,
  route_id UUID REFERENCES routes(id) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_bus_tracking_bus_id ON bus_tracking(bus_id);
CREATE INDEX idx_bus_tracking_route_id ON bus_tracking(route_id);
CREATE INDEX idx_bus_tracking_status ON bus_tracking(status);

-- Add some sample data
INSERT INTO bus_tracking (bus_id, route_id, latitude, longitude, speed, heading)
SELECT 
  b.id,
  r.id,
  13.7565, -- Sample coordinates for Philippines
  121.0583,
  45.5,
  90
FROM buses b
JOIN assignments a ON b.id = a.bus_id
JOIN routes r ON a.route_id = r.id
WHERE b.status = 'active'
LIMIT 5; 