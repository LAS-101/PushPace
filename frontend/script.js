const API_BASE = '/PushPace/api';

// Global logout function
window.logout = async function() {
  try {
    const response = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' })
    });

    if (response.ok) {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};

document.addEventListener('DOMContentLoaded', () => {

  //Detect current page 
  const body = document.body;
  const page = body.classList.contains('page-dashboard') ? 'dashboard'
    : body.classList.contains('page-walking') ? 'walking'
      : body.classList.contains('page-gym') ? 'gym'
        : body.classList.contains('page-running') ? 'running'
          : null;

  // Authentication check - DEFINE FIRST
  async function checkAuthentication() {
    try {
      const response = await fetch(`${API_BASE}/auth.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!data.authenticated) {
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = 'login.html';
    }
  }

  // Check authentication on page load - CALL AFTER DEFINITION
  checkAuthentication();

  
  //Fetch data from API
  async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  //getactivites
  async function getActivities(type) {
    try {
      return await apiFetch(`activities.php?type=${type}`);
    } catch (error) {
      console.error(`Error fetching ${type} activities:`, error);
      return [];
    }
  }

  //create new activitiy
  async function createActivity(type, activityData) {
    try {
      const payload = { type, ...activityData };
      const response = await apiFetch('activities.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error(`Error creating ${type} activity:`, error);
      throw error;
    }
  }

  //delete activity
  async function deleteActivity(type, id) {
    try {
      const response = await apiFetch(`activities.php?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Error deleting ${type} activity:`, error);
      throw error;
    }
  }

  
  async function getProfile() {
    try {
      return await apiFetch('profile.php');
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

 
  async function setProfile(profileData) {
    try {
      const response = await apiFetch('profile.php', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });
      return response.profile;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  //Format helpers
  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  //  CALORIE ESTIMATION
  const MET_TABLE = {
    'bench press': 3.5,
    'bench': 3.5,
    'squat': 5.0,
    'squats': 5.0,
    'deadlift': 6.0,
    'deadlifts': 6.0,
    'pull-up': 8.0,
    'pull-ups': 8.0,
    'pullup': 8.0,
    'pullups': 8.0,
    'shoulder press': 4.0,
    'overhead press': 4.0,
    'bicep curl': 3.0,
    'bicep curls': 3.0,
    'curl': 3.0,
    'tricep': 3.0,
    'row': 4.5,
    'rows': 4.5,
    'lat pulldown': 4.0,
    'leg press': 4.5,
    'lunge': 4.0,
    'lunges': 4.0,
    'plank': 3.0,
    'crunch': 3.5,
    'crunches': 3.5,
    'dip': 5.0,
    'dips': 5.0,
    'default': 4.0,
  };

  function getMET(exerciseName) {
    const lower = exerciseName.toLowerCase();
    for (const key in MET_TABLE) {
      if (lower.includes(key)) return MET_TABLE[key];
    }
    return MET_TABLE['default'];
  }

  function estimateGymCalories(exercises, durationMin, weightKg) {
    if (!weightKg || !durationMin) return 0;
    let totalMET = 0;
    const count = exercises.length;
    if (count === 0) {
      totalMET = MET_TABLE['default'];
    } else {
      exercises.forEach(ex => {
        totalMET += getMET(ex.name);
      });
      totalMET = totalMET / count;
    }
    const hours = durationMin / 60;
    return Math.round(totalMET * weightKg * hours);
  }

  function estimateRunningCalories(distanceKm, weightKg) {
    if (!weightKg || !distanceKm) return 0;
    return Math.round(distanceKm * weightKg * 1.036);
  }

  function estimateWalkingCalories(distanceKm, weightKg) {
    if (!weightKg || !distanceKm) return 0;
    return Math.round(distanceKm * weightKg * 0.53);
  }

  //SVG icon templates
  const ICONS = {
    calendar: `<svg viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/><line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    clock: `<svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/><polyline points="6.5,3.5 6.5,6.5 8.5,8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    distance: `<svg viewBox="0 0 13 13" fill="none"><path d="M2 9c1-3 3-5 4.5-5S10 6 11 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    steps: `<svg viewBox="0 0 13 13" fill="none"><circle cx="5" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><circle cx="9" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>`,
    calories: `<svg viewBox="0 0 13 13" fill="none"><path d="M6.5 1C6.5 1 3 5 3 7.5a3.5 3.5 0 007 0C10 5 6.5 1 6.5 1z" stroke="currentColor" stroke-width="1.2"/></svg>`,
    pace: `<svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/><line x1="6.5" y1="4" x2="6.5" y2="6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="6.5" y1="6.5" x2="9" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    delete: `<svg viewBox="0 0 13 13" fill="none"><line x1="3" y1="3" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="3" x2="3" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    user: `<svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  };

  //  USER PROFILE MODAL
  function showProfileModal(isFirstTime = false) {
    const existing = document.querySelector('.profile-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay profile-overlay active';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const title = isFirstTime
      ? 'Welcome to PushPace 👋'
      : 'Edit Profile';

    const subtitle = isFirstTime
      ? 'To calculate your calories accurately, we need a few details about you.'
      : 'Update your personal details.';

    modal.innerHTML = `
      <div class="modal-header">
        <h3>${title}</h3>
        ${!isFirstTime ? `<button class="modal-close" id="profile-close">${ICONS.delete}</button>` : ''}
      </div>
      <p style="color:var(--muted); font-size:0.85rem; margin-bottom:20px;">${subtitle}</p>
      <form class="modal-form" id="profile-form">
        <div class="form-row">
          <div class="form-group">
            <label for="field-weight">Weight (kg)</label>
            <input type="number" id="field-weight" name="weight" min="30" max="300" step="0.1"
              placeholder="75" required />
          </div>
          <div class="form-group">
            <label for="field-height">Height (cm)</label>
            <input type="number" id="field-height" name="height" min="100" max="250"
              placeholder="175" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="field-age">Age</label>
            <input type="number" id="field-age" name="age" min="10" max="100"
              placeholder="22" required />
          </div>
          <div class="form-group">
            <label for="field-gender">Gender</label>
            <select id="field-gender" name="gender" required>
              <option value="" disabled selected>Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <button type="submit" class="modal-submit">Save Profile</button>
      </form>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    if (!isFirstTime) {
      document.getElementById('profile-close').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const profileData = {
        weight: parseFloat(fd.get('weight')),
        height: parseInt(fd.get('height')),
        age: parseInt(fd.get('age')),
        gender: fd.get('gender'),
      };

      try {
        await setProfile(profileData);
        overlay.remove();
      } catch (error) {
        alert('Error saving profile: ' + error.message);
      }
    });
  }

  // Show profile modal on first visit
  async function checkProfile() {
    const profile = await getProfile();
    if (!profile || !profile.weight) {
      showProfileModal(true);
    }
  }

  //Profile button in header
  function injectProfileButton() {
    const header = document.querySelector('header');
    if (!header) return;
    const btn = document.createElement('button');
    btn.className = 'profile-btn';
    btn.innerHTML = `${ICONS.user} Profile`;
    btn.addEventListener('click', () => showProfileModal(false));
    header.appendChild(btn);
  }

  // Modal system 
  function createModal(title, fields, onSubmit) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<h3>${title}</h3>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = ICONS.delete;
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);

    const form = document.createElement('form');
    form.className = 'modal-form';

    fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'form-group';

      const label = document.createElement('label');
      label.textContent = field.label;
      label.setAttribute('for', `field-${field.name}`);

      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
        input.placeholder = field.placeholder || '';
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        input.placeholder = field.placeholder || '';
        if (field.step) input.step = field.step;
        if (field.min !== undefined) input.min = field.min;
        if (field.readOnly) {
          input.readOnly = true;
          input.style.opacity = '0.6';
          input.style.cursor = 'not-allowed';
        }
      }
      input.name = field.name;
      input.id = `field-${field.name}`;
      input.required = field.required !== false;
      if (field.value !== undefined) input.value = field.value;

      group.appendChild(label);
      group.appendChild(input);
      form.appendChild(group);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'modal-submit';
    submitBtn.textContent = 'Save';
    form.appendChild(submitBtn);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {};
      formData.forEach((val, key) => data[key] = val);
      onSubmit(data);
      overlay.remove();
    });

    modal.appendChild(header);
    modal.appendChild(form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    return { overlay, form };
  }

  // Animated counter
  function animateValue(el, start, end, duration = 1000) {
    const isDecimal = String(end).includes('.');
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      el.textContent = isDecimal ? current.toFixed(1) : formatNumber(Math.round(current));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  //Entrance animations
  function animateEntrance() {
    const cards = document.querySelectorAll('.stat-card, .act-card, .activity-row, .workout-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + i * 80);
    });
  }

  //  WALKING PAGE
  async function renderWalking() {
    const activities = await getActivities('walking');
    const list = document.querySelector('.activity-list');
    if (!list) return;

    list.innerHTML = '';

    if (activities.length === 0) {
      list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:40px 0;">No walking activities yet. Add your first walk!</p>';
      return;
    }

    activities.forEach((act) => {
      const row = document.createElement('div');
      row.className = 'activity-row';
      row.innerHTML = `
        <div>
          <div class="field-label">${ICONS.calendar} Date</div>
          <div class="field-value">${formatDate(act.date)}</div>
        </div>
        <div>
          <div class="field-label">${ICONS.clock} Duration</div>
          <div class="field-value">${act.duration} min</div>
        </div>
        <div>
          <div class="field-label">${ICONS.distance} Distance</div>
          <div class="field-value">${act.distance} km</div>
        </div>
        <div>
          <div class="field-label">${ICONS.steps} Steps</div>
          <div class="field-value">${formatNumber(act.steps)}</div>
        </div>
        <div>
          <div class="field-label">${ICONS.calories} Calories</div>
          <div class="field-value">${act.calories} kcal</div>
        </div>
      `;
      row.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        if (confirm('Delete this walking activity?')) {
          try {
            await deleteActivity('walking', act.id);
            renderWalking();
          } catch (error) {
            alert('Error deleting activity: ' + error.message);
          }
        }
      });
      list.appendChild(row);
    });

    animateEntrance();
  }

  function initWalking() {
    renderWalking();

    const addBtn = document.querySelector('.btn-green');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const profile = await getProfile();
        const fields = [
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'duration', label: 'Duration (min)', type: 'number', min: 1, placeholder: '45' },
          { name: 'distance', label: 'Distance (km)', type: 'number', step: '0.1', min: 0, placeholder: '4.2' },
          { name: 'steps', label: 'Steps', type: 'number', min: 0, placeholder: '5400' },
        ];

        if (profile && profile.weight) {
          fields.push({
            name: 'calories', label: 'Calories (kcal) — auto-calculated',
            type: 'number', readOnly: true, value: '', required: false,
          });
        } else {
          fields.push({
            name: 'calories', label: 'Calories (kcal)',
            type: 'number', min: 0, placeholder: '210',
          });
        }

        const { form } = createModal('Add Walk', fields, async (data) => {
          const distance = parseFloat(data.distance) || 0;
          const calories = profile && profile.weight
            ? estimateWalkingCalories(distance, profile.weight)
            : parseInt(data.calories) || 0;

          try {
            await createActivity('walking', {
              date: data.date,
              duration: parseInt(data.duration) || 0,
              distance,
              steps: parseInt(data.steps) || 0,
              calories,
            });
            renderWalking();
          } catch (error) {
            alert('Error creating activity: ' + error.message);
          }
        });

        // Live preview of calories as user types distance
        if (profile && profile.weight) {
          const distInput = form.querySelector('[name="distance"]');
          const calInput = form.querySelector('[name="calories"]');
          if (distInput && calInput) {
            distInput.addEventListener('input', () => {
              const dist = parseFloat(distInput.value) || 0;
              calInput.value = estimateWalkingCalories(dist, profile.weight);
            });
          }
        }
      });
    }
  }

  //  GYM PAGE
  async function renderGym() {
    const workouts = await getActivities('gym');
    const list = document.querySelector('.workout-list');
    if (!list) return;

    list.innerHTML = '';

    if (workouts.length === 0) {
      list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:40px 0;">No gym workouts yet. Add your first workout!</p>';
      return;
    }

    workouts.forEach((w) => {
      const card = document.createElement('div');
      card.className = 'workout-card';

      let exercisesHTML = '';
      if (w.exercises && w.exercises.length > 0) {
        exercisesHTML = `
          <div class="exercises-label">Exercises:</div>
          <div class="exercises-grid">
            ${w.exercises.map(ex => {
          const weightStr = ex.weight > 0 ? `${ex.weight} kg` : 'Bodyweight';
          return `
                <div class="exercise-card">
                  <div class="exercise-name">${ex.name}</div>
                  <div class="exercise-detail-row">
                    <span class="ex-badge ex-sets">${ex.sets} sets</span>
                    <span class="ex-badge ex-reps">${ex.reps} reps</span>
                    <span class="ex-badge ex-weight">${weightStr}</span>
                  </div>
                </div>
              `;
        }).join('')}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="workout-meta">
          <div class="meta-field">
            <div class="field-label">${ICONS.calendar} Date</div>
            <div class="field-value">${formatDate(w.date)}</div>
          </div>
          <div class="meta-field">
            <div class="field-label">${ICONS.clock} Duration</div>
            <div class="field-value">${w.duration} min</div>
          </div>
          <div class="meta-field">
            <div class="field-label">${ICONS.calories} Calories</div>
            <div class="field-value">${w.calories} kcal</div>
          </div>
        </div>
        ${exercisesHTML}
      `;

      card.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        if (confirm('Delete this gym workout?')) {
          try {
            await deleteActivity('gym', w.id);
            renderGym();
          } catch (error) {
            alert('Error deleting workout: ' + error.message);
          }
        }
      });

      list.appendChild(card);
    });

    animateEntrance();
  }

  function initGym() {
    renderGym();

    const addBtn = document.querySelector('.btn-orange');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const profile = await getProfile();

        // Build modal manually (custom layout for dynamic exercise rows)
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal modal-gym';

        modal.innerHTML = `
          <div class="modal-header">
            <h3>Add Workout</h3>
            <button class="modal-close" id="gym-modal-close">${ICONS.delete}</button>
          </div>
          <form class="modal-form" id="gym-form">
            <div class="form-row">
              <div class="form-group">
                <label for="gym-date">Date</label>
                <input type="date" id="gym-date" name="date" required />
              </div>
              <div class="form-group">
                <label for="gym-duration">Duration (min)</label>
                <input type="number" id="gym-duration" name="duration" min="1" placeholder="60" required />
              </div>
            </div>

            <div class="exercises-form-section">
              <div class="exercises-form-header">
                <span class="exercises-form-title">Exercises</span>
                <button type="button" class="add-exercise-btn" id="add-exercise-row">+ Add Exercise</button>
              </div>
              <div class="exercise-rows-header">
                <span>Exercise Name</span>
                <span>Sets</span>
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span></span>
              </div>
              <div id="exercise-rows"></div>
            </div>

            ${profile && profile.weight ? `
              <div class="form-group">
                <label>Calories (kcal) — auto-calculated</label>
                <input type="number" id="gym-calories" name="calories" readonly
                  style="opacity:0.6; cursor:not-allowed;" placeholder="0" />
              </div>
            ` : `
              <div class="form-group">
                <label for="gym-calories">Calories (kcal)</label>
                <input type="number" id="gym-calories" name="calories" min="0" placeholder="300" required />
              </div>
            `}

            <button type="submit" class="modal-submit">Save Workout</button>
          </form>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        // Close handlers
        document.getElementById('gym-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Exercise row management
        const rowsContainer = document.getElementById('exercise-rows');
        const calInput = document.getElementById('gym-calories');
        const durInput = document.getElementById('gym-duration');

        function getExerciseRows() {
          return Array.from(rowsContainer.querySelectorAll('.exercise-input-row')).map(row => ({
            name: row.querySelector('.ex-name').value.trim(),
            sets: parseInt(row.querySelector('.ex-sets-input').value) || 0,
            reps: parseInt(row.querySelector('.ex-reps-input').value) || 0,
            weight: parseFloat(row.querySelector('.ex-weight-input').value) || 0,
          })).filter(ex => ex.name !== '');
        }

        function updateCalPreview() {
          if (!profile || !profile.weight) return;
          const exercises = getExerciseRows();
          const duration = parseInt(durInput.value) || 0;
          calInput.value = estimateGymCalories(exercises, duration, profile.weight);
        }

        function addExerciseRow(defaultName = '', defaultSets = '', defaultReps = '', defaultWeight = '') {
          const row = document.createElement('div');
          row.className = 'exercise-input-row';
          row.innerHTML = `
            <input type="text"   class="ex-name"         placeholder="Bench Press" value="${defaultName}" />
            <input type="number" class="ex-sets-input"   placeholder="3"  min="1"  value="${defaultSets}" />
            <input type="number" class="ex-reps-input"   placeholder="10" min="1"  value="${defaultReps}" />
            <input type="number" class="ex-weight-input" placeholder="60" min="0" step="0.5" value="${defaultWeight}" />
            <button type="button" class="remove-ex-btn">${ICONS.delete}</button>
          `;

          row.querySelector('.remove-ex-btn').addEventListener('click', () => {
            row.remove();
            updateCalPreview();
          });

          row.querySelectorAll('input').forEach(inp =>
            inp.addEventListener('input', updateCalPreview)
          );

          rowsContainer.appendChild(row);
          row.querySelector('.ex-name').focus();
          updateCalPreview();
        }

        // Start with 1 empty row
        addExerciseRow();

        document.getElementById('add-exercise-row').addEventListener('click', () => addExerciseRow());
        durInput.addEventListener('input', updateCalPreview);

        // Form submit
        document.getElementById('gym-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const exercises = getExerciseRows();
          const duration = parseInt(durInput.value) || 0;
          const calories = profile && profile.weight
            ? estimateGymCalories(exercises, duration, profile.weight)
            : parseInt(calInput.value) || 0;
          const date = document.getElementById('gym-date').value;

          try {
            await createActivity('gym', {
              date,
              duration,
              calories,
              exercises,
            });
            overlay.remove();
            renderGym();
          } catch (error) {
            alert('Error creating workout: ' + error.message);
          }
        });
      });
    }
  }

  //  RUNNING PAGE
  async function renderRunning() {
    const activities = await getActivities('running');
    const list = document.querySelector('.activity-list');
    if (!list) return;

    list.innerHTML = '';

    if (activities.length === 0) {
      list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:40px 0;">No running activities yet. Add your first run!</p>';
      return;
    }

    activities.forEach((act) => {
      const row = document.createElement('div');
      row.className = 'activity-row';
      row.innerHTML = `
        <div>
          <div class="field-label">${ICONS.calendar} Date</div>
          <div class="field-value">${formatDate(act.date)}</div>
        </div>
        <div>
          <div class="field-label">${ICONS.clock} Duration</div>
          <div class="field-value">${act.duration} min</div>
        </div>
        <div>
          <div class="field-label">${ICONS.distance} Distance</div>
          <div class="field-value">${act.distance} km</div>
        </div>
        <div>
          <div class="field-label">${ICONS.pace} Pace</div>
          <div class="field-value">${act.pace} min/km</div>
        </div>
        <div>
          <div class="field-label">${ICONS.calories} Calories</div>
          <div class="field-value">${act.calories} kcal</div>
        </div>
      `;

      row.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        if (confirm('Delete this running activity?')) {
          try {
            await deleteActivity('running', act.id);
            renderRunning();
          } catch (error) {
            alert('Error deleting activity: ' + error.message);
          }
        }
      });

      list.appendChild(row);
    });

    animateEntrance();
  }

  function initRunning() {
    renderRunning();

    const addBtn = document.querySelector('.btn-cyan');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        const profile = await getProfile();
        const fields = [
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'duration', label: 'Duration (min)', type: 'number', min: 1, placeholder: '35' },
          { name: 'distance', label: 'Distance (km)', type: 'number', step: '0.1', min: 0, placeholder: '5.0' },
          { name: 'pace', label: 'Pace (min/km)', type: 'number', step: '0.1', min: 0, placeholder: '6.5' },
        ];

        if (profile && profile.weight) {
          fields.push({
            name: 'calories', label: 'Calories (kcal) — auto-calculated',
            type: 'number', readOnly: true, value: '', required: false,
          });
        } else {
          fields.push({
            name: 'calories', label: 'Calories (kcal)',
            type: 'number', min: 0, placeholder: '300',
          });
        }

        const { form } = createModal('Add Run', fields, async (data) => {
          const distance = parseFloat(data.distance) || 0;
          const calories = profile && profile.weight
            ? estimateRunningCalories(distance, profile.weight)
            : parseInt(data.calories) || 0;

          try {
            await createActivity('running', {
              date: data.date,
              duration: parseInt(data.duration) || 0,
              distance,
              pace: parseFloat(data.pace) || 0,
              calories,
            });
            renderRunning();
          } catch (error) {
            alert('Error creating activity: ' + error.message);
          }
        });

        // Live preview
        if (profile && profile.weight) {
          const distInput = form.querySelector('[name="distance"]');
          const calInput = form.querySelector('[name="calories"]');
          if (distInput && calInput) {
            distInput.addEventListener('input', () => {
              const dist = parseFloat(distInput.value) || 0;
              calInput.value = estimateRunningCalories(dist, profile.weight);
            });
          }
        }
      });
    }
  }

  //  DASHBOARD PAGE
  async function initDashboard() {
    const walking = await getActivities('walking');
    const gym = await getActivities('gym');
    const running = await getActivities('running');

    const totalWorkouts = walking.length + gym.length + running.length;
    const totalCalories = [...walking, ...gym, ...running].reduce((s, a) => s + (a.calories || 0), 0);
    const totalHours = [...walking, ...gym, ...running].reduce((s, a) => s + (a.duration || 0), 0) / 60;
    const totalDistance = [...walking, ...running].reduce((s, a) => s + (a.distance || 0), 0);

    const statValues = document.querySelectorAll('.stat-card .value');
    if (statValues.length >= 4) {
      animateValue(statValues[0], 0, totalWorkouts, 1200);
      animateValue(statValues[1], 0, totalCalories, 1200);
      animateValue(statValues[2], 0, parseFloat(totalHours.toFixed(1)), 1200);
      animateValue(statValues[3], 0, parseFloat(totalDistance.toFixed(1)), 1200);
    }

    const statSubs = document.querySelectorAll('.stat-card .sub');
    if (statSubs.length >= 4) {
      statSubs[1].textContent = 'kcal total';
      statSubs[2].textContent = 'hours total';
      statSubs[3].textContent = 'km total';
    }

    const walkingCard = document.querySelector('.act-card.walking');
    if (walkingCard) {
      const vals = walkingCard.querySelectorAll('.act-row .val');
      if (vals[0]) vals[0].textContent = `${walking.length} sessions`;
      if (vals[1]) vals[1].textContent = `${walking.reduce((s, a) => s + (a.distance || 0), 0).toFixed(1)} km`;
      if (vals[2]) vals[2].textContent = `${formatNumber(walking.reduce((s, a) => s + (a.calories || 0), 0))} kcal`;
    }

    const gymCard = document.querySelector('.act-card.gym');
    if (gymCard) {
      const vals = gymCard.querySelectorAll('.act-row .val');
      if (vals[0]) vals[0].textContent = `${gym.length} sessions`;
      if (vals[1]) vals[1].textContent = `${(gym.reduce((s, a) => s + (a.duration || 0), 0) / 60).toFixed(0)} hours`;
      if (vals[2]) vals[2].textContent = `${formatNumber(gym.reduce((s, a) => s + (a.calories || 0), 0))} kcal`;
    }

    const runningCard = document.querySelector('.act-card.running');
    if (runningCard) {
      const vals = runningCard.querySelectorAll('.act-row .val');
      if (vals[0]) vals[0].textContent = `${running.length} sessions`;
      if (vals[1]) vals[1].textContent = `${running.reduce((s, a) => s + (a.distance || 0), 0).toFixed(1)} km`;
      if (vals[2]) vals[2].textContent = `${formatNumber(running.reduce((s, a) => s + (a.calories || 0), 0))} kcal`;
    }

    animateEntrance();
  }

  //  NAV HOVER EFFECT
  const navLinks = document.querySelectorAll('.nav-tabs a');
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (!link.classList.contains('active')) link.style.color = 'var(--text)';
    });
    link.addEventListener('mouseleave', () => {
      if (!link.classList.contains('active')) link.style.color = '';
    });
  });

  injectProfileButton();
  checkProfile();

  switch (page) {
    case 'dashboard': initDashboard(); break;
    case 'walking': initWalking(); break;
    case 'gym': initGym(); break;
    case 'running': initRunning(); break;
  }
});
