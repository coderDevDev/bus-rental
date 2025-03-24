-- Function to get popular routes
CREATE OR REPLACE FUNCTION get_popular_routes(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  route_id UUID,
  from_city VARCHAR,
  to_city VARCHAR,
  ticket_count BIGINT,
  base_fare DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as route_id,
    fl.city as from_city,
    tl.city as to_city,
    COUNT(t.id) as ticket_count,
    r.base_fare
  FROM routes r
  JOIN locations fl ON r.from_location = fl.id
  JOIN locations tl ON r.to_location = tl.id
  LEFT JOIN tickets t ON r.id = t.route_id
  WHERE r.status = 'active'
  GROUP BY r.id, fl.city, tl.city, r.base_fare
  ORDER BY ticket_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user travel stats
CREATE OR REPLACE FUNCTION get_user_travel_stats(user_uuid UUID)
RETURNS TABLE (
  total_trips BIGINT,
  total_distance DECIMAL,
  total_spent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(t.id) as total_trips,
    COALESCE(SUM(r.distance), 0) as total_distance,
    COALESCE(SUM(t.fare_amount), 0) as total_spent
  FROM tickets t
  JOIN routes r ON t.route_id = r.id
  WHERE t.user_id = user_uuid
  AND t.status != 'cancelled';
END;
$$ LANGUAGE plpgsql; 