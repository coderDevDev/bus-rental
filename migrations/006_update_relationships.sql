-- Create profiles table for user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE tickets
  ADD CONSTRAINT tickets_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id);

ALTER TABLE routes
  ADD CONSTRAINT routes_from_location_fkey 
  FOREIGN KEY (from_location) 
  REFERENCES locations(id),
  ADD CONSTRAINT routes_to_location_fkey 
  FOREIGN KEY (to_location) 
  REFERENCES locations(id);

-- Create trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 