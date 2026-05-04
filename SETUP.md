# PushPace Full-Stack Setup Guide

## Installation & Setup Instructions

### 1. Database Setup (MySQL)

#### Option A: Using phpMyAdmin
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click "Import" tab
3. Choose `database.sql` file from `/home/elyes/Desktop/PushPace/`
4. Click "Go" to execute the SQL

#### Option B: Using MySQL CLI
```bash
mysql -u root -p < /home/elyes/Desktop/PushPace/database.sql
```
(Press Enter for password - default XAMPP password is empty)

#### Option C: Manual
1. Open phpMyAdmin
2. Create a new database named `pushpace_db`
3. Go to SQL tab and copy-paste the contents of `database.sql`
4. Execute

**Verify:** You should see tables: `users`, `walking_activities`, `gym_workouts`, `gym_exercises`, `running_activities`

---

### 2. File Structure Setup

Ensure your XAMPP htdocs is organized as:
```
/opt/lampp/htdocs/  (or C:\xampp\htdocs\ on Windows)
├── PushPace/
│   ├── api/
│   │   ├── config.php         (DB config & helpers)
│   │   ├── profile.php        (Profile endpoints)
│   │   └── activities.php     (Activity CRUD endpoints)
│   ├── frontend/
│   │   ├── dashboard.html
│   │   ├── walking.html
│   │   ├── gym.html
│   │   ├── running.html
│   │   ├── style.css
│   │   └── script.js          (Updated with fetch calls)
│   ├── database.sql           (MySQL setup)
│   ├── README.md
│   └── SETUP.md              (This file)
```

---

### 3. Configure Database Connection (if needed)

Edit `/api/config.php` if your database settings are different:

```php
define('DB_HOST', 'localhost');  // Your MySQL host
define('DB_USER', 'root');       // Your MySQL user
define('DB_PASS', '');           // Your MySQL password
define('DB_NAME', 'pushpace_db'); // Your database name
```

---

### 4. Update API Path in script.js (if needed)

If you're not accessing via `/PushPace/api/`, edit `frontend/script.js` line 13:

```javascript
const API_BASE = '/PushPace/api';  // Change this path if needed
```

---

### 5. Access the Application

After XAMPP is running with MySQL and Apache enabled:

```
http://localhost/PushPace/frontend/dashboard.html
```

Or create an index.php file in `/PushPace/` to auto-redirect:

```php
<?php header('Location: frontend/dashboard.html'); ?>
```

---

## API Endpoints Reference

### Profile Endpoints

**GET** `/api/profile.php`
- Returns user profile (weight, height, age, gender)
- Response: `{ id, username, email, weight, height, age, gender, ... }`

**POST** `/api/profile.php`
- Updates user profile
- Body: `{ weight, height, age, gender }`
- Response: `{ success: true, message, profile }`

---

### Activity Endpoints

**GET** `/api/activities.php?type=walking|gym|running`
- Returns array of activities/workouts
- Response: `[{ id, user_id, date, duration, ... }, ...]`

**POST** `/api/activities.php`
- Creates new activity
- Body: `{ type: 'walking'|'gym'|'running', date, duration, ... }`
- Response: `{ success: true, message, id }`

**DELETE** `/api/activities.php?type=walking|gym|running&id=1`
- Deletes an activity
- Response: `{ success: true, message }`

---

## Data Structure Reference

### Walking Activity
```json
{
  "type": "walking",
  "date": "2026-02-26",
  "duration": 45,
  "distance": 4.2,
  "steps": 5400,
  "calories": 210
}
```

### Gym Workout
```json
{
  "type": "gym",
  "date": "2026-02-26",
  "duration": 75,
  "calories": 320,
  "exercises": [
    { "name": "Bench Press", "sets": 3, "reps": 10, "weight": 60 },
    { "name": "Squats", "sets": 4, "reps": 8, "weight": 80 }
  ]
}
```

### Running Activity
```json
{
  "type": "running",
  "date": "2026-02-27",
  "duration": 35,
  "distance": 5.2,
  "pace": 6.7,
  "calories": 310
}
```

### User Profile
```json
{
  "weight": 75,
  "height": 175,
  "age": 25,
  "gender": "male"
}
```

---

## Security Features Implemented

✅ **Prepared Statements** - All SQL queries use prepared statements to prevent SQL injection
✅ **Input Validation** - Numeric, date, and enum validation on all inputs
✅ **Sanitization** - String inputs are sanitized with `htmlspecialchars()`
✅ **User Isolation** - Activities are filtered by user_id (currently hardcoded as 1)
✅ **JSON Response** - All responses are JSON with proper error codes

---

## Testing with cURL

```bash
# Get profile
curl http://localhost/PushPace/api/profile.php

# Update profile
curl -X POST http://localhost/PushPace/api/profile.php \
  -H "Content-Type: application/json" \
  -d '{"weight":75,"height":175,"age":25,"gender":"male"}'

# Get walking activities
curl http://localhost/PushPace/api/activities.php?type=walking

# Create walking activity
curl -X POST http://localhost/PushPace/api/activities.php \
  -H "Content-Type: application/json" \
  -d '{"type":"walking","date":"2026-03-01","duration":45,"distance":4.2,"steps":5400,"calories":210}'

# Delete walking activity (id=1)
curl -X DELETE http://localhost/PushPace/api/activities.php?type=walking&id=1
```

---

## Troubleshooting

### Error: "Database connection failed"
- Verify MySQL is running: `sudo /opt/lampp/mysql start`
- Check DB credentials in `/api/config.php`
- Verify database `pushpace_db` exists

### Error: "User profile not found" (404)
- Run the database.sql to create sample user
- Verify user with id=1 exists

### Error: "API error 404"
- Check API_BASE path in `script.js`
- Verify files are in correct htdocs location
- Check Apache is running

### Activities not loading
- Check browser console for API errors (F12)
- Verify database tables have data
- Check all activities are for user_id=1

---

## Next Steps: Multi-User Support

To support multiple users, add:
1. User registration/login system
2. Session/JWT authentication
3. Update `getCurrentUserId()` in `config.php` to read from session
4. Hash passwords with `password_hash()` and `password_verify()`

---

## Performance Optimization (Future)

- Add database indexes (already included in schema)
- Implement pagination for large activity lists
- Add caching headers in API responses
- Compress JSON responses

---

## Conversion Summary

| Feature | Before (localStorage) | After (PHP + MySQL) |
|---------|----------------------|-------------------|
| Data Persistence | Browser storage | MySQL Database |
| Scalability | Single browser | Multi-device access |
| Data Backup | Manual export | Database backups |
| Collaboration | Not possible | Multi-user ready |
| Security | Client-side only | Server-side validation |
