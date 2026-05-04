# PushPace Full-Stack Migration - Quick Start

## ⚡ 5-Minute Setup

### Step 1: Create Database (30 seconds)
```bash
# Open phpMyAdmin: http://localhost/phpmyadmin
# Click "Import" tab
# Select: /home/elyes/Desktop/PushPace/database.sql
# Click "Go"
```

Or via MySQL CLI:
```bash
mysql -u root -p < /home/elyes/Desktop/PushPace/database.sql
# Just press Enter for password (default XAMPP)
```

### Step 2: Verify File Structure
```
/opt/lampp/htdocs/PushPace/  (or C:\xampp\htdocs\PushPace\)
├── api/
│   ├── config.php           ✓
│   ├── profile.php          ✓
│   └── activities.php       ✓
├── frontend/
│   ├── dashboard.html       ✓
│   ├── walking.html         ✓
│   ├── gym.html             ✓
│   ├── running.html         ✓
│   ├── script.js            ✓
│   └── style.css            ✓
├── database.sql             ✓
├── SETUP.md                 ✓
├── ARCHITECTURE.md          ✓
├── index.php                ✓
└── README.md
```

### Step 3: Start XAMPP
```bash
# Make sure Apache and MySQL are running
sudo /opt/lampp/start

# Check: http://localhost/dashboard.xml shows Apache page
```

### Step 4: Access Application
```
http://localhost/PushPace/
```

That's it! The app should load.

---

## 🧪 Quick Test

### Test 1: Profile
1. Click "Profile" button
2. Enter: Weight 75kg, Height 175cm, Age 25, Gender Male
3. Click "Save Profile"
4. ✅ Profile saved successfully

### Test 2: Add Walking Activity
1. Click "Walking" tab
2. Click "Add Walk" button
3. Fill in: Date (today), Duration (45), Distance (4.5), Steps (5400)
4. Click "Save"
5. ✅ Activity appears in list

### Test 3: Add Gym Workout
1. Click "Gym" tab
2. Click "Add Workout" button
3. Add exercises: Bench Press (3x10x60kg), Squats (4x8x80kg)
4. Click "Save"
5. ✅ Workout appears with exercises

### Test 4: Dashboard Summary
1. Click "Dashboard"
2. ✅ See total workouts, calories, time, distance updated

---

## 📋 What Changed From Original

| Feature | Before | After |
|---------|--------|-------|
| Data Location | Browser localStorage | MySQL Database |
| Multi-Device | ❌ No | ✅ Yes |
| Persistence | Session-based | Permanent |
| Backup | Manual | Database backups |
| Scalability | Limited | Unlimited |
| Security | Client-side | Server-side + validation |

---

## 🛠️ Configuration

### If DB connection fails:
Edit `/api/config.php`:
```php
define('DB_HOST', 'localhost');   // Your MySQL host
define('DB_USER', 'root');        // Your MySQL user
define('DB_PASS', '');            // Your MySQL password
define('DB_NAME', 'pushpace_db');  // Database name
```

### If API not found:
Edit `frontend/script.js` line 13:
```javascript
const API_BASE = '/PushPace/api';  // Adjust path if needed
```

---

## 🔗 API Endpoints

### Profile
```
GET  http://localhost/PushPace/api/profile.php
POST http://localhost/PushPace/api/profile.php
```

### Activities
```
GET    http://localhost/PushPace/api/activities.php?type=walking
POST   http://localhost/PushPace/api/activities.php
DELETE http://localhost/PushPace/api/activities.php?type=walking&id=1
```

---

## 📚 Documentation

- **SETUP.md** - Detailed setup & troubleshooting
- **ARCHITECTURE.md** - Technical overview & migration details
- **database.sql** - Database schema & sample data

---

## ✅ Features

✅ User Profile Management (weight, height, age, gender)
✅ Walking Activity Tracking
✅ Gym Workout Tracking (exercises with sets/reps/weight)
✅ Running Activity Tracking
✅ Auto-calculated Calories (based on profile)
✅ Dashboard with Statistics
✅ Data Persistence (MySQL Database)
✅ RESTful API
✅ Prepared Statements (SQL Injection Protection)
✅ Input Validation & Sanitization

---

## 🚀 Next Steps

1. **Multi-User:** Add authentication system
2. **Mobile:** Create mobile app connecting to same API
3. **Analytics:** Add charts and graphs
4. **Export:** Add CSV/PDF export functionality
5. **Sync:** Real-time sync across devices

---

## 💡 How It Works Now

```
User Action (Click "Save")
         ↓
JavaScript → fetch() to PHP API
         ↓
PHP receives request → Validates input
         ↓
Prepared SQL Query → MySQL Database
         ↓
Response → JSON to JavaScript
         ↓
UI Updates (rendered on page)
```

---

**Ready to go! Start using PushPace with persistent data storage!** 🎉
