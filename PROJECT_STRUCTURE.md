# 📂 PushPace Project Structure - Full Overview

## Complete Directory Tree

```
PushPace/                              ← Your project root
│
├── 🌐 Frontend (HTML/CSS/JavaScript)
│   └── frontend/
│       ├── dashboard.html             ← Main dashboard page
│       ├── walking.html               ← Walking activities page
│       ├── gym.html                   ← Gym workouts page
│       ├── running.html               ← Running activities page
│       ├── script.js                  ← Main JavaScript (UPDATED with fetch API)
│       └── style.css                  ← Styling (unchanged)
│
├── 🔌 Backend API (PHP)
│   └── api/
│       ├── config.php                 ← Database config & helpers
│       ├── profile.php                ← Profile GET/POST endpoints
│       └── activities.php             ← Activity CRUD endpoints
│
├── 💾 Database
│   └── database.sql                   ← MySQL schema & sample data
│
│
└── 🚀 Entry Point
    └── index.php                      ← Redirects to frontend/dashboard.html
```

---

## 📋 File Descriptions

### Frontend Files

#### `frontend/dashboard.html`
- Main dashboard showing statistics
- Total workouts, calories, active time, distance
- Activity summaries from all types
- Profile button in header

#### `frontend/walking.html`
- Walking activities list
- Add walk button opens modal
- Shows: date, duration, distance, steps, calories
- Right-click to delete

#### `frontend/gym.html`
- Gym workouts list
- Add workout with dynamic exercises
- Shows exercises with sets, reps, weight
- Auto-calculates calories from exercises

#### `frontend/running.html`
- Running activities list
- Add run button opens modal
- Shows: date, duration, distance, pace, calories
- Right-click to delete

#### `frontend/script.js` (UPDATED)
- API helper functions:
  - `getActivities(type)` - Fetch activities from API
  - `createActivity(type, data)` - Create new activity
  - `deleteActivity(type, id)` - Delete activity
  - `getProfile()` - Get user profile
  - `setProfile(data)` - Update profile
- Calorie estimation functions (preserved)
- Modal and UI logic (preserved)

#### `frontend/style.css`
- Complete UI styling
- Responsive design
- Theme colors and animations

---

### Backend Files

#### `api/config.php`
**Key Functions:**
- `getDB()` - Database connection
- `sendResponse($data, $statusCode)` - Send JSON response
- `sendError($message, $statusCode)` - Send error response
- `getCurrentUserId()` - Get current user (hardcoded as 1)
- `validateRequired($data, $fields)` - Validate required fields
- `sanitizeString($input)` - Sanitize input
- `validateNumber($value, $min, $max)` - Validate numeric input
- `validateDate($date)` - Validate date format
- `validateGender($gender)` - Validate gender enum
- `getRequestData()` - Get GET/POST/JSON data

#### `api/profile.php`
**GET Endpoint:**
```
GET /api/profile.php
→ Returns user profile
→ Response: { id, username, email, weight, height, age, gender }
```

**POST Endpoint:**
```
POST /api/profile.php
→ Body: { weight, height, age, gender }
→ Validates all inputs
→ Updates database
→ Returns: { success, message, profile }
```

#### `api/activities.php`
**GET Endpoint:**
```
GET /api/activities.php?type=walking|gym|running
→ Returns array of activities
→ Includes nested exercises for gym
```

**POST Endpoint:**
```
POST /api/activities.php
→ Body: { type, date, duration, distance/calories, steps/exercises, ... }
→ Validates all inputs
→ Creates record in database
→ Returns: { success, message, id }
```

**DELETE Endpoint:**
```
DELETE /api/activities.php?type=walking&id=1
→ Deletes activity by ID
→ Validates user owns the activity
→ Returns: { success, message }
```

---

### Database Files

#### `database.sql`
Contains:
- CREATE DATABASE statement
- CREATE TABLE statements for all 5 tables
- Foreign key relationships
- Indexes for performance
- Sample user (id=1)
- Sample data for all activity types


## 🔗 Data Flow Diagrams

### Profile Management Flow
```
Profile Button Click
         ↓
showProfileModal()
         ↓
User enters: weight, height, age, gender
         ↓
Form submit
         ↓
setProfile(data)
         ↓
fetch('api/profile.php', {method: 'POST', body: JSON.stringify(data)})
         ↓
PHP validates input
         ↓
UPDATE users table
         ↓
Return success response
         ↓
UI updates (modal closes)
```

### Activity Creation Flow
```
Add Activity Button Click
         ↓
createModal() with form fields
         ↓
User fills form + clicks Save
         ↓
Form validation
         ↓
createActivity(type, data)
         ↓
fetch('api/activities.php', {method: 'POST', body: JSON.stringify({type, ...data})})
         ↓
PHP validates input (type-specific)
         ↓
INSERT into appropriate table
         ↓
For gym: also INSERT exercises into gym_exercises
         ↓
Return { success: true, id }
         ↓
renderWalking/Gym/Running()
         ↓
fetch API again to get updated list
         ↓
UI displays new data
```

### Activity Deletion Flow
```
Right-click Activity
         ↓
confirm('Delete this activity?')
         ↓
User clicks OK
         ↓
deleteActivity(type, id)
         ↓
fetch('api/activities.php?type=X&id=Y', {method: 'DELETE'})
         ↓
PHP validates user owns this activity
         ↓
DELETE from appropriate table
         ↓
Return success response
         ↓
renderWalking/Gym/Running()
         ↓
UI reflects deletion
```

---

## 🗄️ Database Relationships

```
users (1)
  ├────→ (many) walking_activities
  ├────→ (many) gym_workouts
  │                ├────→ (many) gym_exercises
  │                │
  └────────────────┘
  │
  └────→ (many) running_activities
```

---

## 🔧 Configuration Files

### `api/config.php` - Key Settings
```php
define('DB_HOST', 'localhost');      // MySQL host
define('DB_USER', 'root');           // MySQL user
define('DB_PASS', '');               // MySQL password
define('DB_NAME', 'pushpace_db');    // Database name
```

### `frontend/script.js` - Key Settings
```javascript
const API_BASE = '/PushPace/api';    // API endpoint path
```

---

## 📊 API Response Examples

### Profile GET Response
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "weight": 75,
  "height": 175,
  "age": 25,
  "gender": "male",
  "created_at": "2026-05-04 18:50:00"
}
```

### Walking Activities GET Response
```json
[
  {
    "id": 1,
    "user_id": 1,
    "date": "2026-02-26",
    "duration": 45,
    "distance": 4.2,
    "steps": 5400,
    "calories": 210,
    "created_at": "2026-05-04 18:50:00"
  },
  ...
]
```

### Gym Workouts GET Response
```json
[
  {
    "id": 1,
    "user_id": 1,
    "date": "2026-02-26",
    "duration": 75,
    "calories": 320,
    "created_at": "2026-05-04 18:50:00",
    "exercises": [
      {
        "id": 1,
        "workout_id": 1,
        "name": "Bench Press",
        "sets": 3,
        "reps": 10,
        "weight": 60
      },
      ...
    ]
  },
  ...
]
```

### Error Response
```json
{
  "error": "Invalid weight. Must be between 30 and 300 kg."
}
```

---
