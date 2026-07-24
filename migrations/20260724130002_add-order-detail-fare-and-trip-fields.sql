-- Order Management screen needs a distance/time fare split and trip distance
-- for the Route Visualization + Fare Breakdown panel. Adds auditable columns
-- (same spirit as base_fare/service_fee_amount: the amount actually charged,
-- not recomputed later) and backfills existing rows from pickup/dropoff
-- coordinates, recorded lifecycle timestamps, and each order's own
-- vehicle_type rate in fare_config.

ALTER TABLE orders
  ADD COLUMN distance_fare_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN time_fare_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN trip_distance_km     DOUBLE PRECISION,
  ADD COLUMN trip_duration_minutes INTEGER;

WITH computed AS (
  SELECT
    o.id,
    CASE
      WHEN o.pickup_lat IS NULL OR o.dropoff_lat IS NULL THEN NULL
      ELSE 6371 * 2 * asin(sqrt(
        sin(radians(o.dropoff_lat - o.pickup_lat) / 2) ^ 2 +
        cos(radians(o.pickup_lat)) * cos(radians(o.dropoff_lat)) *
        sin(radians(o.dropoff_lng - o.pickup_lng) / 2) ^ 2
      ))
    END AS distance_km,
    CASE
      WHEN o.completed_at IS NULL OR COALESCE(o.trip_started_at, o.accepted_at) IS NULL THEN NULL
      ELSE GREATEST(round((extract(epoch FROM (o.completed_at - COALESCE(o.trip_started_at, o.accepted_at))) / 60)::numeric), 0)
    END AS duration_minutes,
    fc.per_km,
    fc.per_minute,
    GREATEST(o.fare_amount - o.base_fare - o.service_fee_amount, 0) AS remainder
  FROM orders o
  LEFT JOIN fare_config fc ON fc.vehicle_type = o.vehicle_type AND fc.is_active = true
),
split AS (
  SELECT
    id,
    distance_km,
    duration_minutes,
    remainder,
    COALESCE(distance_km, 0) * COALESCE(per_km, 0) AS distance_component,
    COALESCE(duration_minutes, 0) * COALESCE(per_minute, 0) AS time_component
  FROM computed
)
UPDATE orders o
SET
  trip_distance_km = split.distance_km,
  trip_duration_minutes = split.duration_minutes,
  distance_fare_amount = CASE
    WHEN split.distance_component + split.time_component > 0
      THEN round((split.remainder * split.distance_component / (split.distance_component + split.time_component))::numeric, 2)
    ELSE split.remainder
  END,
  time_fare_amount = CASE
    WHEN split.distance_component + split.time_component > 0
      THEN round((split.remainder - (split.remainder * split.distance_component / (split.distance_component + split.time_component)))::numeric, 2)
    ELSE 0
  END
FROM split
WHERE o.id = split.id;
