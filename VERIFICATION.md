# PushPace Migration - Verification Checklist

## ✅ Pre-Deployment Verification

### 1. File Structure
- [ ] `/api/config.php` exists
- [ ] `/api/profile.php` exists
- [ ] `/api/activities.php` exists
- [ ] `/frontend/dashboard.html` exists
- [ ] `/frontend/walking.html` exists
- [ ] `/frontend/gym.html` exists
- [ ] `/frontend/running.html` exists
- [ ] `/frontend/script.js` exists
- [ ] `/frontend/style.css` exists
- [ ] `/database.sql` exists
- [ ] `/index.php` exists

### 2. Database Setup
- [ ] XAMPP MySQL running
- [ ] Database `pushpace_db` created
- [ ] All tables created:
  - [ ] `users` table
  - [ ] `walking_activities` table
  - [ ] `gym_workouts` table
  - [ ] `gym_exercises` table
  - [ ] `running_activities` table
- [ ] Sample user (id=1) created
- [ ] Sample data loaded

### 3. PHP Configuration
- [ ] `/api/config.php` has correct DB credentials
- [ ] DB_HOST = 'localhost' ✓
- [ ] DB_USER = 'root' ✓
- [ ] DB_PASS = '' (empty) ✓
- [ ] DB_NAME = 'pushpace_db' ✓

### 4. Frontend Configuration
- [ ] `/frontend/script.js` API_BASE path is correct
- [ ] API_BASE = '/PushPace/api' (adjust if needed)
- [ ] All HTML files reference correct script.js path
- [ ] CSS file path is correct in HTML

### 5. API Testing

#### Profile Endpoint
```bash
curl http://localhost/PushPace/api/profile.php
```
- [ ] Returns user profile (no errors)
- [ ] Response contains: id, weight, height, age, gender

#### Walking Activities
```bash
curl http://localhost/PushPace/api/activities.php?type=walking
```
- [ ] Returns array of walking activities
- [ ] No error message
- [ ] Sample data visible (or empty array)

#### Gym Workouts
```bash
curl http://localhost/PushPace/api/activities.php?type=gym
```
- [ ] Returns array of gym workouts
- [ ] Exercises nested properly

#### Running Activities
```bash
curl http://localhost/PushPace/api/activities.php?type=running
```
- [ ] Returns array of running activities
- [ ] No error message

### 6. Browser Testing

#### Dashboard Page
```
http://localhost/PushPace/
```
- [ ] Page loads without errors
- [ ] Logo and navigation visible
- [ ] Profile button visible in header
- [ ] Dashboard stats display (may show 0s initially)
- [ ] All activity cards visible

#### First Visit (Profile)
- [ ] Profile modal appears on first visit
- [ ] Form fields visible (weight, height, age, gender)
- [ ] Form submission works
- [ ] Profile saved (no errors)

#### Walking Page
```
http://localhost/PushPace/frontend/walking.html
```
- [ ] Page loads without errors
- [ ] Activity list visible or empty message
- [ ] "Add Walk" button visible and clickable
- [ ] Modal opens when clicking button
- [ ] Can fill form and save
- [ ] New activity appears in list
- [ ] Right-click to delete works

#### Gym Page
```
http://localhost/PushPace/frontend/gym.html
```
- [ ] Page loads without errors
- [ ] Workout list visible or empty message
- [ ] "Add Workout" button visible and clickable
- [ ] Can add exercises dynamically
- [ ] Form calculates calories when profile exists
- [ ] Exercises display correctly in card

#### Running Page
```
http://localhost/PushPace/frontend/running.html
```
- [ ] Page loads without errors
- [ ] Activity list visible or empty message
- [ ] "Add Run" button visible and clickable
- [ ] Can fill form and save
- [ ] New activity appears in list

### 7. Data Persistence
- [ ] Close browser
- [ ] Reopen: http://localhost/PushPace/
- [ ] Activities still visible (persisted in DB)
- [ ] Profile data still there

### 8. Error Handling
- [ ] Try invalid profile data (age 1000) → error shown
- [ ] Try invalid date (2026-13-01) → error shown
- [ ] Try negative distance → error shown
- [ ] Try missing required fields → error shown
- [ ] Network errors handled gracefully

### 9. Cross-Browser Testing
- [ ] Firefox loads correctly
- [ ] Chrome loads correctly
- [ ] Safari loads correctly (if available)
- [ ] No console errors (F12 → Console tab)

### 10. Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] Adding activity responds quickly
- [ ] Deleting activity removes instantly
- [ ] No lag when scrolling

---

## 🔍 Browser Developer Tools Checks

### Console (F12)
- [ ] No red error messages
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] All fetch requests successful (200/201 status)

### Network Tab (F12)
- [ ] Check API calls:
  - [ ] `profile.php` returns 200
  - [ ] `activities.php` returns 200
- [ ] Response payloads are valid JSON
- [ ] No failed requests

### Storage (F12)
- [ ] No localStorage data needed (data in MySQL)
- [ ] Session storage empty (only if using sessions)

---

## 🛠️ Troubleshooting Steps

### If Database Connection Failed:
1. [ ] Check MySQL is running: `systemctl status mysql`
2. [ ] Check credentials in config.php
3. [ ] Verify database exists: `mysql -u root -e "SHOW DATABASES;"`
4. [ ] Verify tables exist: `mysql -u root pushpace_db -e "SHOW TABLES;"`

### If API Returns 404:
1. [ ] Check Apache is running
2. [ ] Verify file paths in htdocs
3. [ ] Check API_BASE in script.js
4. [ ] Check .htaccess rules (if any)

### If Activities Not Loading:
1. [ ] Check browser console (F12) for errors
2. [ ] Check network tab for API response status
3. [ ] Verify user_id=1 exists in database
4. [ ] Check table has sample data

### If Profile Modal Appears Every Time:
1. [ ] This is expected on first visit
2. [ ] After saving, should not appear again
3. [ ] Check profile was saved in MySQL: `SELECT * FROM users;`

---

## 📊 Data Integrity Checks

### In MySQL Console:
```sql
-- Check user exists
SELECT COUNT(*) FROM users;

-- Check activities created
SELECT COUNT(*) FROM walking_activities;
SELECT COUNT(*) FROM gym_workouts;
SELECT COUNT(*) FROM gym_exercises;
SELECT COUNT(*) FROM running_activities;

-- Check specific data
SELECT * FROM users WHERE id=1;
SELECT * FROM walking_activities WHERE user_id=1 ORDER BY date DESC;
```

---

## 🚀 Pre-Production Checklist

- [ ] All verification steps passed
- [ ] Database backed up
- [ ] Credentials stored securely
- [ ] Error logging enabled
- [ ] HTTPS enabled (optional for production)
- [ ] Admin panel created (optional)
- [ ] User documentation prepared
- [ ] Support process defined

---

## 📝 Sign-Off

- [ ] Development complete
- [ ] Testing complete
- [ ] Documentation complete
- [ ] Ready for production

**Date:** ___________
**Tested By:** ___________

---

## 🎯 Success Criteria

Your migration is successful when:

✅ All files are in correct directories
✅ Database is created with sample data
✅ All API endpoints respond with data
✅ Frontend loads and displays activities
✅ Can add/edit/delete activities
✅ Data persists between sessions
✅ No console errors in browser
✅ Profile system works
✅ Dashboard shows aggregated stats
✅ All pages load without errors

**Congratulations! PushPace is now a full-stack application!** 🎉
