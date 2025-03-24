-- Insert sample route schedules
INSERT INTO route_schedules (route_id, departure_time, arrival_time, days_of_week)
SELECT 
  r.id,
  '08:00:00'::TIME,
  '10:00:00'::TIME,
  ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
FROM routes r
WHERE r.status = 'active';

-- Insert sample assignments
INSERT INTO assignments (conductor_id, bus_id, route_id, start_date, end_date, status)
SELECT 
  c.id,
  b.id,
  r.id,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 day',
  'active'
FROM 
  routes r
  CROSS JOIN LATERAL (
    SELECT id FROM conductors WHERE status = 'active' LIMIT 1
  ) c
  CROSS JOIN LATERAL (
    SELECT id FROM buses WHERE status = 'active' LIMIT 1
  ) b
WHERE r.status = 'active'; 