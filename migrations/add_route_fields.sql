-- Add distance, estimated_duration, and fare columns to the routes table
ALTER TABLE routes 
ADD COLUMN distance NUMERIC DEFAULT 0,
ADD COLUMN estimated_duration INTEGER DEFAULT 0,
ADD COLUMN fare NUMERIC DEFAULT 0;

-- Update existing routes with default values
UPDATE routes SET distance = 0, estimated_duration = 0, fare = 0;

