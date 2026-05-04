# PushPace: Local Storage → Full-Stack PHP+MySQL Migration

## Overview

This guide covers the complete migration of PushPace from a **localStorage-based frontend application** to a **full-stack application** using **PHP backend** and **MySQL database**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                   │
│     dashboard.html, walking.html, gym.html, running.html    │
│                      script.js (AJAX)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    fetch() API Calls
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend API Layer (PHP)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/config.php      - DB connection & helpers      │  │
│  │ /api/profile.php     - User profile endpoints       │  │
│  │ /api/activities.php  - Activity CRUD endpoints      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   mysqli prepared statements
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     MySQL Database                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ users                                                │  │
│  │ walking_activities                                   │  │
│  │ gym_workouts, gym_exercises                          │  │
│  │ running_activities                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## What Changed

### 1. **Data Storage**

| Aspect | Before | After |
|--------|--------|-------|
| Storage Medium | Browser localStorage | MySQL Database |
| Persistence | Session-based | Permanent |
| Accessibility | Single browser only | Any device with credentials |
| Backup | Manual export | Database backups |

### 2. **Data Flow**

**Before (localStorage):**
```
User Action → JavaScript → localStorage.setItem() → Data in browser
            ← localStorage.getItem() ← Read from browser
```

**After (PHP + MySQL):**
```
User Action → JavaScript → fetch() → PHP API → MySQL Query → Response
            ← JSON Response ← Process Data ← Retrieve from DB
```

### 3. **Helper Functions Migration**

| Original Function | New Implementation |
|-------------------|-------------------|
| `getData(key)` | `fetch('api/activities.php?type=walking')` |
| `setData(key, data)` | `fetch('api/activities.php', {method: 'POST', body: JSON.stringify(data)})` |
| `getProfile()` | `fetch('api/profile.php')` |
| `setProfile(data)` | `fetch('api/profile.php', {method: 'POST', body: JSON.stringify(data)})` |

---

## Database Schema

### users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  weight DECIMAL(5, 2),
  height INT,
  age INT,
  gender ENUM('male', 'female'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### walking_activities Table
```sql
CREATE TABLE walking_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL (FK → users.id),
  date DATE,
  duration INT (minutes),
  distance DECIMAL(5, 2) (km),
  steps INT,
  calories INT,
  created_at TIMESTAMP
);
```

### gym_workouts & gym_exercises Tables
```sql
CREATE TABLE gym_workouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL (FK → users.id),
  date DATE,
  duration INT (minutes),
  calories INT,
  created_at TIMESTAMP
);

CREATE TABLE gym_exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workout_id INT NOT NULL (FK → gym_workouts.id),
  name VARCHAR(255),
  sets INT,
  reps INT,
  weight DECIMAL(5, 2) (kg)
);
```

### running_activities Table
```sql
CREATE TABLE running_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL (FK → users.id),
  date DATE,
  duration INT (minutes),
  distance DECIMAL(5, 2) (km),
  pace DECIMAL(4, 2) (min/km),
  calories INT,
  created_at TIMESTAMP
);
```

---

## PHP API Endpoints

### Profile Management
```
GET  /api/profile.php
└─ Retrieve user profile
└─ Response: { id, username, email, weight, height, age, gender }

POST /api/profile.php
└─ Update user profile
└─ Body: { weight, height, age, gender }
└─ Response: { success, message, profile }
```

### Activity Management
```
GET  /api/activities.php?type=walking|gym|running
└─ Retrieve all activities of specified type
└─ Response: [{ id, date, duration, ... }, ...]

POST /api/activities.php
└─ Create new activity
└─ Body: { type, date, duration, distance, ... }
└─ Response: { success, message, id }

DELETE /api/activities.php?type=walking&id=1
└─ Delete activity by ID
└─ Response: { success, message }
```

---

## Frontend Changes (JavaScript)

### Before: Using localStorage
```javascript
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Usage
let activities = getData('pushpace_walking');
activities.push(newActivity);
setData('pushpace_walking', activities);
```

### After: Using fetch API
```javascript
async function getActivities(type) {
  const response = await fetch(`/PushPace/api/activities.php?type=${type}`);
  return await response.json();
}

async function createActivity(type, activityData) {
  const response = await fetch('/PushPace/api/activities.php', {
    method: 'POST',
    body: JSON.stringify({ type, ...activityData })
  });
  return await response.json();
}

// Usage
const activities = await getActivities('walking');
await createActivity('walking', newActivity);
```

---

## Security Improvements

### 1. **Prepared Statements**
Prevents SQL injection attacks:
```php
$stmt = $db->prepare("SELECT * FROM walking_activities WHERE user_id = ?");
$stmt->bind_param('i', $userId);
$stmt->execute();
```

### 2. **Input Validation**
```php
if (!validateNumber($data['distance'], 0)) {
    sendError('Invalid distance.', 400);
}

if (!validateDate($data['date'])) {
    sendError('Invalid date format. Use YYYY-MM-DD.', 400);
}
```

### 3. **Data Sanitization**
```php
$name = sanitizeString($exercise['name']);
// Removes XSS attack vectors
```

### 4. **User Isolation**
```php
// All queries filtered by user_id
$query = "SELECT * FROM walking_activities WHERE user_id = ? AND id = ?";
```

---

## Installation Checklist

- [ ] XAMPP installed and running (Apache + MySQL)
- [ ] Database created: `pushpace_db`
- [ ] Tables created from `database.sql`
- [ ] PHP files uploaded to `/opt/lampp/htdocs/PushPace/api/`
- [ ] HTML files updated and in `/opt/lampp/htdocs/PushPace/frontend/`
- [ ] `script.js` in frontend folder (with fetch API calls)
- [ ] API_BASE path verified in `script.js`
- [ ] Database connection tested in `api/config.php`
- [ ] Sample user created (user_id = 1)
- [ ] Application accessible at `http://localhost/PushPace/`

---

## Testing Workflow

### 1. Test Profile Endpoint
```bash
curl http://localhost/PushPace/api/profile.php
```
Expected: `{ id: 1, username: "testuser", weight: 75, ... }`

### 2. Test Get Activities
```bash
curl http://localhost/PushPace/api/activities.php?type=walking
```
Expected: Array of walking activities

### 3. Test Create Activity
```bash
curl -X POST http://localhost/PushPace/api/activities.php \
  -H "Content-Type: application/json" \
  -d '{
    "type": "walking",
    "date": "2026-03-05",
    "duration": 30,
    "distance": 2.5,
    "steps": 3000,
    "calories": 150
  }'
```
Expected: `{ success: true, message: "...", id: 4 }`

### 4. Test Delete Activity
```bash
curl -X DELETE http://localhost/PushPace/api/activities.php?type=walking&id=4
```
Expected: `{ success: true, message: "Walking activity deleted" }`

### 5. Test in Browser
- Open `http://localhost/PushPace/`
- Fill profile form (first time)
- Add walking/gym/running activities
- Verify they appear in dashboard
- Test delete via right-click

---

## Common Issues & Solutions

### Issue: "404 Not Found" on API calls
**Solution:** Check `API_BASE` path in `script.js` matches your directory structure
```javascript
const API_BASE = '/PushPace/api';
```

### Issue: "Database connection failed"
**Solution:** Verify credentials in `/api/config.php`
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'pushpace_db');
```

### Issue: "User profile not found" (404)
**Solution:** Ensure default user exists in database
```sql
INSERT INTO users (username, email, password_hash, weight, height, age, gender)
VALUES ('testuser', 'test@example.com', NULL, 75, 175, 25, 'male');
```

### Issue: Activities not displaying
**Solution:** Check browser console (F12) for API errors, verify MySQL is running

---

## Future Enhancements

### Authentication
```php
// Add login/registration system
// Use JWT tokens or session cookies
// Replace getCurrentUserId() with session-based ID
```

### Pagination
```php
// Add pagination for large datasets
// Limit results to 50 per page
// Add offset parameter to API
```

### Data Export
```php
// Export activities to CSV
// Backup entire profile
// Generate PDF reports
```

### Advanced Filtering
```php
// Filter by date range
// Filter by activity type
// Sort by calories, distance, etc.
```

### Multi-User Support
```php
// User management dashboard
// Admin panel
// Sharing features
```

---

## File Structure Reference

```
/opt/lampp/htdocs/PushPace/
│
├── api/                          ← Backend API
│   ├── config.php               ← Database configuration
│   ├── profile.php              ← User profile endpoints
│   └── activities.php           ← Activity CRUD operations
│
├── frontend/                     ← Frontend (HTML/CSS/JS)
│   ├── index.html               ← (optional) Landing page
│   ├── dashboard.html           ← Main dashboard
│   ├── walking.html             ← Walking activities
│   ├── gym.html                 ← Gym workouts
│   ├── running.html             ← Running activities
│   ├── script.js                ← Main JavaScript (with fetch)
│   └── style.css                ← Styling
│
├── database.sql                 ← MySQL setup script
├── SETUP.md                     ← Setup instructions
├── ARCHITECTURE.md              ← This file
└── index.php                    ← Redirect to dashboard
```

---

## Key Takeaways

✅ **Scalable:** Database can handle millions of records
✅ **Secure:** SQL injection and XSS attack protected
✅ **Persistent:** Data survives browser crashes and sessions
✅ **Accessible:** Can access from any device
✅ **Professional:** Production-ready code structure
✅ **Maintainable:** Clean separation of concerns (API, Frontend, DB)

---

**Congratulations! You've successfully converted PushPace from a client-side app to a full-stack application!**
