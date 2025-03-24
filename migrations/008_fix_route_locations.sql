-- First drop any existing constraints if they exist
ALTER TABLE routes 
  DROP CONSTRAINT IF EXISTS routes_from_location_fkey,
  DROP CONSTRAINT IF EXISTS routes_to_location_fkey;

-- Add the correct foreign key constraints
ALTER TABLE routes
  ADD CONSTRAINT routes_from_location_fkey 
    FOREIGN KEY (from_location) 
    REFERENCES locations(id)
    ON DELETE RESTRICT,
  ADD CONSTRAINT routes_to_location_fkey 
    FOREIGN KEY (to_location) 
    REFERENCES locations(id)
    ON DELETE RESTRICT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routes_from_location ON routes(from_location);
CREATE INDEX IF NOT EXISTS idx_routes_to_location ON routes(to_location); 