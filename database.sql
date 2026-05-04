-- PushPace Database Schema
-- Create this database in MySQL using phpMyAdmin or MySQL CLI

CREATE DATABASE IF NOT EXISTS pushpace_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pushpace_db;

-- Users Table (stores profile data)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  weight DECIMAL(5, 2),
  height INT,
  age INT,
  gender ENUM('male', 'female'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Walking Activities Table
CREATE TABLE walking_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  duration INT NOT NULL,
  distance DECIMAL(5, 2) NOT NULL,
  steps INT NOT NULL,
  calories INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gym Workouts Table
CREATE TABLE gym_workouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  duration INT NOT NULL,
  calories INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gym Exercises Table (for exercises within a workout)
CREATE TABLE gym_exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workout_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sets INT NOT NULL,
  reps INT NOT NULL,
  weight DECIMAL(5, 2) NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES gym_workouts(id) ON DELETE CASCADE
);

-- Running Activities Table
CREATE TABLE running_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  duration INT NOT NULL,
  distance DECIMAL(5, 2) NOT NULL,
  pace DECIMAL(4, 2) NOT NULL,
  calories INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_user_date ON walking_activities(user_id, date DESC);
CREATE INDEX idx_gym_user_date ON gym_workouts(user_id, date DESC);
CREATE INDEX idx_running_user_date ON running_activities(user_id, date DESC);

-- Insert a default user (USER_ID = 1) for testing
-- Password: password123 (hashed with password_hash())
INSERT INTO users (username, email, password_hash, weight, height, age, gender)
VALUES ('testuser', 'test@example.com', NULL, 75, 175, 25, 'male');

-- Seed sample walking data
INSERT INTO walking_activities (user_id, date, duration, distance, steps, calories)
VALUES
  (1, '2026-02-26', 45, 4.2, 5400, 210),
  (1, '2026-02-24', 30, 3.5, 4200, 180),
  (1, '2026-02-22', 60, 6.0, 7800, 290);

-- Seed sample gym workout data
INSERT INTO gym_workouts (user_id, date, duration, calories)
VALUES
  (1, '2026-02-26', 75, 320),
  (1, '2026-02-23', 60, 280);

-- Seed gym exercises for the workouts
INSERT INTO gym_exercises (workout_id, name, sets, reps, weight)
VALUES
  (1, 'Bench Press', 3, 10, 60),
  (1, 'Squats', 4, 8, 80),
  (1, 'Deadlifts', 3, 6, 100),
  (2, 'Pull-ups', 3, 12, 0),
  (2, 'Shoulder Press', 3, 10, 40),
  (2, 'Bicep Curls', 3, 12, 15);

-- Seed sample running data
INSERT INTO running_activities (user_id, date, duration, distance, pace, calories)
VALUES
  (1, '2026-02-27', 35, 5.2, 6.7, 310),
  (1, '2026-02-25', 28, 4.0, 7.0, 240),
  (1, '2026-02-23', 42, 6.5, 6.5, 380);
