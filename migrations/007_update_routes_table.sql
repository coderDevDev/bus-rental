-- Drop the assigned_buses column and other unused columns
ALTER TABLE routes
  DROP COLUMN IF EXISTS assigned_buses,
  DROP COLUMN IF EXISTS start_location,
  DROP COLUMN IF EXISTS end_location,
  DROP COLUMN IF EXISTS schedule;

-- Ensure we have all needed columns
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS route_number VARCHAR(50) NOT NULL,
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS from_location UUID REFERENCES locations(id),
  ADD COLUMN IF NOT EXISTS to_location UUID REFERENCES locations(id),
  ADD COLUMN IF NOT EXISTS distance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS base_fare DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_duration INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
  ADD CONSTRAINT routes_status_check CHECK (status IN ('active', 'inactive'));

-- Add unique constraint on route_number
ALTER TABLE routes
  ADD CONSTRAINT routes_route_number_key UNIQUE (route_number); 