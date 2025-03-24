-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('passenger', 'conductor', 'admin')),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create conductors table
CREATE TABLE conductors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conductor_id TEXT UNIQUE NOT NULL,
    license_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'on_leave')),
    current_route_id UUID,
    current_bus_id UUID,
    experience_years INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create buses table
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number TEXT UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'maintenance', 'inactive')),
    current_route_id UUID,
    current_conductor_id UUID REFERENCES conductors(id),
    last_maintenance TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_maintenance TIMESTAMPTZ NOT NULL,
    mileage INTEGER NOT NULL DEFAULT 0,
    bus_type TEXT NOT NULL CHECK (bus_type IN ('standard', 'luxury', 'express')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create routes table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
    assigned_buses UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create route_schedules table
CREATE TABLE route_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    days_of_week TEXT[] NOT NULL,
    bus_id UUID NOT NULL REFERENCES buses(id),
    conductor_id UUID NOT NULL REFERENCES conductors(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create maintenance table
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('routine', 'repair', 'major')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completion_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    conductor_id UUID NOT NULL REFERENCES conductors(id),
    route_id UUID NOT NULL REFERENCES routes(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraints for buses table after all tables are created
ALTER TABLE buses
ADD CONSTRAINT fk_current_route
FOREIGN KEY (current_route_id)
REFERENCES routes(id);

-- Add foreign key constraints for conductors table
ALTER TABLE conductors
ADD CONSTRAINT fk_current_route
FOREIGN KEY (current_route_id)
REFERENCES routes(id),
ADD CONSTRAINT fk_current_bus
FOREIGN KEY (current_bus_id)
REFERENCES buses(id);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_conductors_user_id ON conductors(user_id);
CREATE INDEX idx_conductors_status ON conductors(status);
CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_maintenance_bus_id ON maintenance(bus_id);
CREATE INDEX idx_maintenance_status ON maintenance(status);
CREATE INDEX idx_assignments_bus_id ON assignments(bus_id);
CREATE INDEX idx_assignments_conductor_id ON assignments(conductor_id);
CREATE INDEX idx_assignments_route_id ON assignments(route_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conductors_updated_at
    BEFORE UPDATE ON conductors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at
    BEFORE UPDATE ON buses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_schedules_updated_at
    BEFORE UPDATE ON route_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
-- Users
INSERT INTO users (email, role, name) VALUES
('admin@busgo.com', 'admin', 'Admin User'),
('conductor1@busgo.com', 'conductor', 'James Smith'),
('conductor2@busgo.com', 'conductor', 'Sarah Wilson');

-- Conductors
INSERT INTO conductors (user_id, conductor_id, license_number, phone, status, experience_years)
SELECT 
    id,
    'CON-' || DATE_PART('year', NOW())::TEXT || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 3, '0'),
    'LIC-' || FLOOR(RANDOM() * 1000000)::TEXT,
    '+1-555-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    'active',
    FLOOR(RANDOM() * 10 + 1)::INTEGER
FROM users WHERE role = 'conductor';

-- Routes
INSERT INTO routes (route_number, name, start_location, end_location, status) VALUES
('R101', 'New York - Boston Express', 'New York', 'Boston', 'active'),
('R102', 'Boston - Washington DC', 'Boston', 'Washington DC', 'active'),
('R103', 'Philadelphia - New York', 'Philadelphia', 'New York', 'active');

-- Buses
INSERT INTO buses (bus_number, capacity, status, bus_type, next_maintenance) VALUES
('BUS-2024-001', 45, 'active', 'express', NOW() + INTERVAL '30 days'),
('BUS-2024-002', 40, 'active', 'standard', NOW() + INTERVAL '30 days'),
('BUS-2024-003', 35, 'maintenance', 'luxury', NOW() + INTERVAL '5 days');

-- Maintenance records
INSERT INTO maintenance (bus_id, type, status, scheduled_date, notes)
SELECT 
    id,
    'routine',
    'scheduled',
    next_maintenance,
    'Routine maintenance check'
FROM buses;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON conductors
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON buses
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON routes
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON route_schedules
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON maintenance
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON assignments
    FOR SELECT
    USING (true);

-- Admin policies for full access
CREATE POLICY "Enable full access for admins" ON users
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Enable full access for admins" ON conductors
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Enable full access for admins" ON buses
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Enable full access for admins" ON routes
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Enable full access for admins" ON route_schedules
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Enable full access for admins" ON maintenance
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Enable full access for admins" ON assignments
    FOR ALL
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

