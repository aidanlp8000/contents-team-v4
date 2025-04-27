-- database/seed.sql

-- 1. Admin User (no payment required)
INSERT INTO users 
  (oauth_provider, oauth_id, email, name, photo_url, role, membership_status, stripe_customer_id)
VALUES 
  ('google', 'admin-oauth-id-123', 'aidan.l.paluch@gmail.com', 'Aidan Paluch', NULL, 'admin', 'active', NULL);

-- 2. Paid Regular User
INSERT INTO users 
  (oauth_provider, oauth_id, email, name, photo_url, role, membership_status, stripe_customer_id)
VALUES 
  ('google', 'user-oauth-id-456', 'testuser@example.com', 'Test User', NULL, 'user', 'active', 'cus_test123');

-- 3. Example Projects for Paid User (user_id = 2)
INSERT INTO projects 
  (user_id, title, description, insured_name, insured_address, claim_number, date_of_loss, type_of_loss)
VALUES
  (2, 'House Fire Claim - Johnson Residence', 'Major kitchen and living room fire', 'John Johnson', '123 Elm St, Springfield, IL', 'CLM-1001', '2025-04-10', 'fire'),
  (2, 'Water Loss - Basement Flood', 'Severe flood damage in basement', 'Jane Smith', '456 Oak Ave, Springfield, IL', 'CLM-1002', '2025-03-22', 'water');

-- 4. Example Items for Project 1 (id = 1)
INSERT INTO items 
  (project_id, name, model, quantity, price, source, photo_url)
VALUES
  (1, 'Samsung 55" LED TV', 'UN55NU7100', 1, 499.99, 'BestBuy', 'https://example.com/photos/tv1.jpg'),
  (1, 'Leather Sofa', 'LSF-200', 1, 799.00, 'Wayfair', 'https://example.com/photos/sofa1.jpg');

-- 5. Example Items for Project 2 (id = 2)
INSERT INTO items 
  (project_id, name, model, quantity, price, source, photo_url)
VALUES
  (2, 'Dehumidifier X200', 'DHX200', 2, 150.00, 'HomeDepot', 'https://example.com/photos/dehum1.jpg'),
  (2, 'Box Fan', 'BF-100', 3, 29.99, 'Amazon', 'https://example.com/photos/fan1.jpg');
