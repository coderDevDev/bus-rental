-- Enable RLS on tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view active routes"
  ON routes FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Allow users to create tickets
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()); 