-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id) NOT NULL,
  bus_id UUID REFERENCES buses(id) NOT NULL,
  conductor_id UUID REFERENCES conductors(id) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_assignments_route_id ON assignments(route_id);
CREATE INDEX idx_assignments_bus_id ON assignments(bus_id);
CREATE INDEX idx_assignments_conductor_id ON assignments(conductor_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Add RLS policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments are viewable by everyone" ON assignments
  FOR SELECT USING (true);

CREATE POLICY "Assignments are insertable by admins" ON assignments
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Assignments are updatable by admins" ON assignments
  FOR UPDATE USING (auth.role() = 'admin');

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp(); 