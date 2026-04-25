// ─────────────────────────────────────────────
//  PushPace – Main Script
//  Single JS file for all pages
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Detect current page ──────────────────────
  const body = document.body;
  const page = body.classList.contains('page-dashboard') ? 'dashboard'
             : body.classList.contains('page-walking')   ? 'walking'
             : body.classList.contains('page-gym')       ? 'gym'
             : body.classList.contains('page-running')   ? 'running'
             : null;

  // ── LocalStorage helpers ─────────────────────
  const STORAGE_KEYS = {
    walking: 'pushpace_walking',
    gym:     'pushpace_gym',
    running: 'pushpace_running',
  };

  function getData(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch { return []; }
  }

  function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ── Seed default data if empty ───────────────
  function seedDefaults() {
    if (getData(STORAGE_KEYS.walking).length === 0) {
      setData(STORAGE_KEYS.walking, [
        { date: '2026-02-26', duration: 45, distance: 4.2, steps: 5400, calories: 210 },
        { date: '2026-02-24', duration: 30, distance: 3.5, steps: 4200, calories: 180 },
        { date: '2026-02-22', duration: 60, distance: 6.0, steps: 7800, calories: 290 },
      ]);
    }
    if (getData(STORAGE_KEYS.gym).length === 0) {
      setData(STORAGE_KEYS.gym, [
        { date: '2026-02-26', duration: 75, calories: 320, exercises: [
          { name: 'Bench Press', detail: '3 × 10 @ 60 kg' },
          { name: 'Squats',      detail: '4 × 8 @ 80 kg' },
          { name: 'Deadlifts',   detail: '3 × 6 @ 100 kg' },
        ]},
        { date: '2026-02-23', duration: 60, calories: 280, exercises: [
          { name: 'Pull-ups',       detail: '3 × 12' },
          { name: 'Shoulder Press', detail: '3 × 10 @ 40 kg' },
          { name: 'Bicep Curls',    detail: '3 × 12 @ 15 kg' },
        ]},
      ]);
    }
    if (getData(STORAGE_KEYS.running).length === 0) {
      setData(STORAGE_KEYS.running, [
        { date: '2026-02-27', duration: 35, distance: 5.2, pace: 6.7, calories: 310 },
        { date: '2026-02-25', duration: 28, distance: 4.0, pace: 7.0, calories: 240 },
        { date: '2026-02-23', duration: 42, distance: 6.5, pace: 6.5, calories: 380 },
      ]);
    }
  }
  seedDefaults();

  // ── Format helpers ───────────────────────────
  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  // ── SVG icon templates (matching your existing icons) ──
  const ICONS = {
    calendar: `<svg viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/><line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="9" y1="1" x2="9" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    clock: `<svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/><polyline points="6.5,3.5 6.5,6.5 8.5,8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    distance: `<svg viewBox="0 0 13 13" fill="none"><path d="M2 9c1-3 3-5 4.5-5S10 6 11 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    steps: `<svg viewBox="0 0 13 13" fill="none"><circle cx="5" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><circle cx="9" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>`,
    calories: `<svg viewBox="0 0 13 13" fill="none"><path d="M6.5 1C6.5 1 3 5 3 7.5a3.5 3.5 0 007 0C10 5 6.5 1 6.5 1z" stroke="currentColor" stroke-width="1.2"/></svg>`,
    pace: `<svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/><line x1="6.5" y1="4" x2="6.5" y2="6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="6.5" y1="6.5" x2="9" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    delete: `<svg viewBox="0 0 13 13" fill="none"><line x1="3" y1="3" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="3" x2="3" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  };

  // ── Modal system ─────────────────────────────
  function createModal(title, fields, onSubmit) {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Modal
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<h3>${title}</h3>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = ICONS.delete;
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);

    // Form
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
      }
      input.name = field.name;
      input.id = `field-${field.name}`;
      input.required = field.required !== false;

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

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ── Animated counter ─────────────────────────
  function animateValue(el, start, end, duration = 1000) {
    const isDecimal = String(end).includes('.');
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = formatNumber(Math.round(current));
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // ── Entrance animations ──────────────────────
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

  // ──────────────────────────────────────────────
  //  WALKING PAGE
  // ──────────────────────────────────────────────
  function renderWalking() {
    const activities = getData(STORAGE_KEYS.walking);
    const list = document.querySelector('.activity-list');
    if (!list) return;

    list.innerHTML = '';

    if (activities.length === 0) {
      list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:40px 0;">No walking activities yet. Add your first walk!</p>';
      return;
    }

    activities.forEach((act, index) => {
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
      // Delete on right-click
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Delete this walking activity?')) {
          activities.splice(index, 1);
          setData(STORAGE_KEYS.walking, activities);
          renderWalking();
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
      addBtn.addEventListener('click', () => {
        createModal('Add Walk', [
          { name: 'date',     label: 'Date',          type: 'date',   required: true },
          { name: 'duration', label: 'Duration (min)', type: 'number', min: 1, placeholder: '45' },
          { name: 'distance', label: 'Distance (km)',  type: 'number', step: '0.1', min: 0, placeholder: '4.2' },
          { name: 'steps',    label: 'Steps',          type: 'number', min: 0, placeholder: '5400' },
          { name: 'calories', label: 'Calories (kcal)',type: 'number', min: 0, placeholder: '210' },
        ], (data) => {
          const activities = getData(STORAGE_KEYS.walking);
          activities.unshift({
            date:     data.date,
            duration: parseInt(data.duration) || 0,
            distance: parseFloat(data.distance) || 0,
            steps:    parseInt(data.steps) || 0,
            calories: parseInt(data.calories) || 0,
          });
          setData(STORAGE_KEYS.walking, activities);
          renderWalking();
        });
      });
    }
  }

  // ──────────────────────────────────────────────
  //  GYM PAGE
  // ──────────────────────────────────────────────
  function renderGym() {
    const workouts = getData(STORAGE_KEYS.gym);
    const list = document.querySelector('.workout-list');
    if (!list) return;

    list.innerHTML = '';

    if (workouts.length === 0) {
      list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:40px 0;">No gym workouts yet. Add your first workout!</p>';
      return;
    }

    workouts.forEach((w, index) => {
      const card = document.createElement('div');
      card.className = 'workout-card';

      let exercisesHTML = '';
      if (w.exercises && w.exercises.length > 0) {
        exercisesHTML = `
          <div class="exercises-label">Exercises:</div>
          <div class="exercises-grid">
            ${w.exercises.map(ex => `
              <div class="exercise-card">
                <div class="exercise-name">${ex.name}</div>
                <div class="exercise-detail">${ex.detail}</div>
              </div>
            `).join('')}
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

      // Delete on right-click
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Delete this gym workout?')) {
          workouts.splice(index, 1);
          setData(STORAGE_KEYS.gym, workouts);
          renderGym();
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
      addBtn.addEventListener('click', () => {
        createModal('Add Workout', [
          { name: 'date',      label: 'Date',           type: 'date',     required: true },
          { name: 'duration',  label: 'Duration (min)',  type: 'number',   min: 1, placeholder: '60' },
          { name: 'calories',  label: 'Calories (kcal)', type: 'number',   min: 0, placeholder: '300' },
          { name: 'exercises', label: 'Exercises (one per line: Name – Detail)', type: 'textarea', placeholder: 'Bench Press – 3 × 10 @ 60 kg\nSquats – 4 × 8 @ 80 kg', required: false },
        ], (data) => {
          const exercises = [];
          if (data.exercises) {
            data.exercises.split('\n').filter(l => l.trim()).forEach(line => {
              const parts = line.split('–').map(s => s.trim());
              if (parts.length < 2) {
                // Try with dash
                const parts2 = line.split('-').map(s => s.trim());
                exercises.push({ name: parts2[0] || line.trim(), detail: parts2.slice(1).join('-').trim() || '' });
              } else {
                exercises.push({ name: parts[0], detail: parts.slice(1).join('–').trim() });
              }
            });
          }

          const workouts = getData(STORAGE_KEYS.gym);
          workouts.unshift({
            date:      data.date,
            duration:  parseInt(data.duration) || 0,
            calories:  parseInt(data.calories) || 0,
            exercises: exercises,
          });
          setData(STORAGE_KEYS.gym, workouts);
          renderGym();
        });
      });
    }
  }

  // ──────────────────────────────────────────────
  //  RUNNING PAGE
  // ──────────────────────────────────────────────
  function renderRunning() {
    const activities = getData(STORAGE_KEYS.running);
    const list = document.querySelector('.activity-list');
    if (!list) return;

    list.innerHTML = '';

    if (activities.length === 0) {
      list.innerHTML = '<p style="color:var(--muted); text-align:center; padding:40px 0;">No running activities yet. Add your first run!</p>';
      return;
    }

    activities.forEach((act, index) => {
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

      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Delete this running activity?')) {
          activities.splice(index, 1);
          setData(STORAGE_KEYS.running, activities);
          renderRunning();
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
      addBtn.addEventListener('click', () => {
        createModal('Add Run', [
          { name: 'date',     label: 'Date',            type: 'date',   required: true },
          { name: 'duration', label: 'Duration (min)',   type: 'number', min: 1, placeholder: '35' },
          { name: 'distance', label: 'Distance (km)',    type: 'number', step: '0.1', min: 0, placeholder: '5.0' },
          { name: 'pace',     label: 'Pace (min/km)',    type: 'number', step: '0.1', min: 0, placeholder: '6.5' },
          { name: 'calories', label: 'Calories (kcal)',  type: 'number', min: 0, placeholder: '300' },
        ], (data) => {
          const activities = getData(STORAGE_KEYS.running);
          activities.unshift({
            date:     data.date,
            duration: parseInt(data.duration) || 0,
            distance: parseFloat(data.distance) || 0,
            pace:     parseFloat(data.pace) || 0,
            calories: parseInt(data.calories) || 0,
          });
          setData(STORAGE_KEYS.running, activities);
          renderRunning();
        });
      });
    }
  }

  // ──────────────────────────────────────────────
  //  DASHBOARD PAGE
  // ──────────────────────────────────────────────
  function initDashboard() {
    const walking  = getData(STORAGE_KEYS.walking);
    const gym      = getData(STORAGE_KEYS.gym);
    const running  = getData(STORAGE_KEYS.running);

    // Calculate totals
    const totalWorkouts = walking.length + gym.length + running.length;

    const totalCalories = [walking, gym, running]
      .flat()
      .reduce((sum, a) => sum + (a.calories || 0), 0);

    const totalHours = [walking, gym, running]
      .flat()
      .reduce((sum, a) => sum + (a.duration || 0), 0) / 60;

    const totalDistance = [...walking, ...running]
      .reduce((sum, a) => sum + (a.distance || 0), 0);

    // Update stat cards
    const statValues = document.querySelectorAll('.stat-card .value');
    if (statValues.length >= 4) {
      animateValue(statValues[0], 0, totalWorkouts, 1200);
      animateValue(statValues[1], 0, totalCalories, 1200);
      animateValue(statValues[2], 0, parseFloat(totalHours.toFixed(1)), 1200);
      animateValue(statValues[3], 0, parseFloat(totalDistance.toFixed(1)), 1200);
    }

    // Update sub labels
    const statSubs = document.querySelectorAll('.stat-card .sub');
    if (statSubs.length >= 4) {
      statSubs[1].textContent = 'kcal total';
      statSubs[2].textContent = 'hours total';
      statSubs[3].textContent = 'km total';
    }

    // Update activity summary cards
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

  // ──────────────────────────────────────────────
  //  NAV HOVER EFFECT
  // ──────────────────────────────────────────────
  const navLinks = document.querySelectorAll('.nav-tabs a');
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (!link.classList.contains('active')) {
        link.style.color = 'var(--text)';
      }
    });
    link.addEventListener('mouseleave', () => {
      if (!link.classList.contains('active')) {
        link.style.color = '';
      }
    });
  });

  // ──────────────────────────────────────────────
  //  INIT
  // ──────────────────────────────────────────────
  switch (page) {
    case 'dashboard': initDashboard(); break;
    case 'walking':   initWalking();   break;
    case 'gym':       initGym();       break;
    case 'running':   initRunning();   break;
  }

});
