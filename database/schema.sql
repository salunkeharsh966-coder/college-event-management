-- =====================================================================
--  College Event Management & Student Registration System
--  Database schema (MySQL 8.x)
--  ------------------------------------------------------------------
--  Run this file FIRST, then run seed.sql
--  Command:  mysql -u root -p < database/schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS college_event_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_event_db;

-- Drop in child-first order so foreign keys do not block the reset.
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------
-- Table: users
-- Stores both ADMIN and STUDENT accounts in one table.
-- The `role` column decides which dashboard the user sees.
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  full_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL,
  password       VARCHAR(100) NOT NULL,          -- BCrypt hash, never plain text
  phone          VARCHAR(15)  DEFAULT NULL,
  course         VARCHAR(60)  DEFAULT NULL,      -- e.g. B.Sc. Computer Science
  roll_number    VARCHAR(30)  DEFAULT NULL,
  role           VARCHAR(10)  NOT NULL DEFAULT 'STUDENT',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'STUDENT'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Table: events
-- One row per college event.  `created_by` records which admin made it.
-- ---------------------------------------------------------------------
CREATE TABLE events (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  title                 VARCHAR(150) NOT NULL,
  description           TEXT,
  event_date            DATE         NOT NULL,
  event_time            TIME         NOT NULL,
  venue                 VARCHAR(150) NOT NULL,
  department            VARCHAR(80)  DEFAULT NULL,
  organizer             VARCHAR(100) DEFAULT NULL,
  capacity              INT          NOT NULL,
  registration_deadline DATE         NOT NULL,
  status                VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
  created_by            BIGINT       DEFAULT NULL,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_date (event_date),
  KEY idx_events_status (status),
  CONSTRAINT fk_events_creator FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_events_capacity CHECK (capacity > 0),
  CONSTRAINT chk_events_status CHECK (
    status IN ('UPCOMING', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Table: registrations
-- The join table between users and events (many-to-many with extra data).
-- `uq_user_event` stops a student registering twice for the same event.
-- ---------------------------------------------------------------------
CREATE TABLE registrations (
  id            BIGINT      NOT NULL AUTO_INCREMENT,
  user_id       BIGINT      NOT NULL,
  event_id      BIGINT      NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
  registered_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_event (user_id, event_id),
  KEY idx_reg_event (event_id),
  CONSTRAINT fk_reg_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT chk_reg_status CHECK (
    status IN ('CONFIRMED', 'CANCELLED', 'ATTENDED'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Quick sanity check after running
-- ---------------------------------------------------------------------
SELECT 'Schema created successfully' AS result;
SHOW TABLES;
