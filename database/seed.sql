-- =====================================================================
--  College Event Management & Student Registration System
--  Sample data (seed script)
--  ------------------------------------------------------------------
--  Run AFTER schema.sql
--  Command:  mysql -u root -p < database/seed.sql
--
--  LOGIN DETAILS (see README for the table)
--    Admin   : admin@college.edu   / admin123
--    Student : rahul@student.edu   / student123
--
--  The password column stores BCrypt hashes (never plain text).
--  The two hashes below were generated with BCryptPasswordEncoder
--  using strength 10, which is the Spring Security default.
-- =====================================================================

USE college_event_db;

-- Start from a clean slate so the script can be re-run safely.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE registrations;
TRUNCATE TABLE events;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Users
-- ---------------------------------------------------------------------
INSERT INTO users (full_name, email, password, phone, course, roll_number, role) VALUES
-- Admin account (can log in to the admin dashboard)
('Dr. Anjali Deshmukh', 'admin@college.edu',
 '$2a$10$bXfz2xsZvAncBNP7AIa/lO73SMiOQD.2D1ikpdWu351X8YcqKkz.i',
 '9820011001', NULL, NULL, 'ADMIN'),

-- Student accounts (all use the password: student123)
('Rahul Sharma', 'rahul@student.edu',
 '$2a$10$fbRYtkieiuKGnzRYttA.m.Bv6t9cFewdMMPGlkcOFAUauJrZQ65Se',
 '9820022002', 'B.Sc. Computer Science', 'CS2023001', 'STUDENT'),

('Sneha Patil', 'sneha@student.edu',
 '$2a$10$fbRYtkieiuKGnzRYttA.m.Bv6t9cFewdMMPGlkcOFAUauJrZQ65Se',
 '9820033003', 'B.Sc. Information Technology', 'IT2023004', 'STUDENT'),

('Amit Kulkarni', 'amit@student.edu',
 '$2a$10$fbRYtkieiuKGnzRYttA.m.Bv6t9cFewdMMPGlkcOFAUauJrZQ65Se',
 '9820044004', 'B.Sc. Computer Science', 'CS2023012', 'STUDENT'),

('Priya Nair', 'priya@student.edu',
 '$2a$10$fbRYtkieiuKGnzRYttA.m.Bv6t9cFewdMMPGlkcOFAUauJrZQ65Se',
 '9820055005', 'B.Com.', 'CM2023008', 'STUDENT');

-- ---------------------------------------------------------------------
-- 2. Events
-- event_date / registration_deadline use dates in the near future so the
-- "upcoming events" list is never empty when you demo the project.
-- ---------------------------------------------------------------------
INSERT INTO events
  (title, description, event_date, event_time, venue, department,
   organizer, capacity, registration_deadline, status, created_by)
VALUES
('Code Sprint 2026',
 'A three-hour competitive programming contest covering data structures, algorithms and problem solving. Participants may use C, C++, Java or Python. Individual entry only.',
 DATE_ADD(CURDATE(), INTERVAL 10 DAY), '10:00:00', 'Computer Lab 2, 3rd Floor',
 'Computer Science', 'Prof. S. R. Joshi', 60,
 DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'OPEN', 1),

('Web Development Bootcamp',
 'A hands-on workshop where students build and deploy a small responsive website using HTML, CSS, JavaScript and Bootstrap. Bring your own laptop.',
 DATE_ADD(CURDATE(), INTERVAL 15 DAY), '09:30:00', 'Seminar Hall A',
 'Computer Science', 'Prof. M. A. Shaikh', 40,
 DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN', 1),

('Tech Quiz Finals',
 'An inter-college quiz on computer fundamentals, emerging technology and general IT awareness. Teams of two. Exciting prizes for the top three teams.',
 DATE_ADD(CURDATE(), INTERVAL 20 DAY), '11:00:00', 'Auditorium',
 'Information Technology', 'Prof. K. V. Rao', 100,
 DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN', 1),

('Robotics Exhibition',
 'Students display working robotics and IoT mini-projects. Open to all departments. Visitors can interact with the models and talk to the teams.',
 DATE_ADD(CURDATE(), INTERVAL 25 DAY), '13:00:00', 'Ground Floor Exhibition Area',
 'Electronics', 'Prof. D. P. More', 150,
 DATE_ADD(CURDATE(), INTERVAL 22 DAY), 'UPCOMING', 1),

('Annual Cultural Fest - Aarambh',
 'The college annual cultural festival with music, dance, drama and food stalls. Registration is required only for the stage competitions.',
 DATE_ADD(CURDATE(), INTERVAL 30 DAY), '16:00:00', 'Main Campus Ground',
 'Student Council', 'Cultural Secretary', 500,
 DATE_ADD(CURDATE(), INTERVAL 26 DAY), 'UPCOMING', 1),

('Career Guidance Seminar',
 'A seminar on internship and placement preparation, resume building and interview skills, conducted by alumni working in the IT industry.',
 DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00', 'Seminar Hall B',
 'Placement Cell', 'T&P Officer', 120,
 DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'OPEN', 1),

('Hackathon 24H',
 'A twenty-four hour hackathon where teams of four build a working prototype for a given social problem. Mentors are available throughout the night.',
 DATE_ADD(CURDATE(), INTERVAL 40 DAY), '08:00:00', 'Innovation Centre',
 'Computer Science', 'Prof. S. R. Joshi', 80,
 DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'UPCOMING', 1);

-- ---------------------------------------------------------------------
-- 3. Registrations
-- A couple of students signed up for the first few events.
-- ---------------------------------------------------------------------
INSERT INTO registrations (user_id, event_id, status) VALUES
(2, 1, 'CONFIRMED'),
(2, 2, 'CONFIRMED'),
(3, 1, 'CONFIRMED'),
(3, 3, 'CONFIRMED'),
(4, 2, 'CONFIRMED'),
(4, 6, 'CONFIRMED'),
(5, 5, 'CONFIRMED');

-- ---------------------------------------------------------------------
-- 4. Verify
-- ---------------------------------------------------------------------
SELECT 'Seed data inserted successfully' AS result;
SELECT COUNT(*) AS total_users         FROM users;
SELECT COUNT(*) AS total_events        FROM events;
SELECT COUNT(*) AS total_registrations FROM registrations;

-- Show how full each event is (this is the same calculation the
-- admin dashboard performs in the Java service layer).
SELECT
  e.id,
  e.title,
  e.capacity,
  COUNT(r.id)                        AS registered,
  (e.capacity - COUNT(r.id))         AS seats_left
FROM events e
LEFT JOIN registrations r
       ON r.event_id = e.id AND r.status <> 'CANCELLED'
GROUP BY e.id, e.title, e.capacity
ORDER BY e.id;
