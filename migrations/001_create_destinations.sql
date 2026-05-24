-- 001_create_destinations.sql
-- Run on Hostinger MySQL when migrating away from data/destinations.json.

CREATE TABLE IF NOT EXISTS destinations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  tagline VARCHAR(200) NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  best_time VARCHAR(120) NOT NULL DEFAULT '',
  currency CHAR(3) NOT NULL DEFAULT '',
  image_keywords VARCHAR(200) NOT NULL DEFAULT '',
  booking_query VARCHAR(200) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
