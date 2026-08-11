-- Production data salvage from zhpebukm_Najenga
-- This SQL imports the production users with Laravel-compatible passwords

-- First, let's update the existing users table to match Laravel requirements
-- We'll reset passwords to a known bcrypt hash for 'password123'

-- Users from production (we need to ensure they exist and have working passwords)
-- The bcrypt hash for 'password123' is: $2y$12$eImiTXuWVxfM37uY4JANjQ.TwcLJD80TJpqq6l6Zo/q3q7wlFxcBS

-- Insert/Update users from production
INSERT INTO users (id, username, email, password, first_name, last_name, phone, role, status, profile_image, created_at, updated_at)
VALUES 
(3, 'danobam', 'danielobam@gmail.com', '$2y$12$eImiTXuWVxfM37uY4JANjQ.TwcLJD80TJpqq6l6Zo/q3q7wlFxcBS', 'Daniel', 'Obam', '+254700000001', 'admin', 'active', NULL, NOW(), NOW()),
(4, 'haggai', 'haggai@thura.co.ke', '$2y$12$eImiTXuWVxfM37uY4JANjQ.TwcLJD80TJpqq6l6Zo/q3q7wlFxcBS', 'Haggai', 'Tambo', '+254700000002', 'admin', 'active', NULL, NOW(), NOW()),
(5, 'catherine', 'catherine@thura.co.ke', '$2y$12$eImiTXuWVxfM37uY4JANjQ.TwcLJD80TJpqq6l6Zo/q3q7wlFxcBS', 'Catherine', 'Nzuki', '+254700000003', 'client', 'active', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    username = VALUES(username),
    email = VALUES(email),
    password = VALUES(password),
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    role = VALUES(role),
    status = VALUES(status),
    updated_at = NOW();

-- Update existing users 1 and 2 with working passwords
UPDATE users SET password = '$2y$12$eImiTXuWVxfM37uY4JANjQ.TwcLJD80TJpqq6l6Zo/q3q7wlFxcBS' WHERE id IN (1, 2);
