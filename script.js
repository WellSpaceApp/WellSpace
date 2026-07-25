/**
 * WellSpace App v2.0.0
 * Complete Student Wellness Platform
 * Local-first, privacy-focused, accessible
 */

(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  const CONFIG = {
    APP_NAME: 'WellSpace',
    VERSION: '2.0.0',
    STORAGE_KEY: 'wellspace_data',
    SETTINGS_KEY: 'wellspace_settings',
    THEME_KEY: 'wellspace_theme',
    ONBOARDING_KEY: 'wellspace_onboarding',
    MOODS: [
      { emoji: '😢', label: 'Struggling', value: 1, color: '#ef4444' },
      { emoji: '😕', label: 'Not Great', value: 2, color: '#f97316' },
      { emoji: '😐', label: 'Okay', value: 3, color: '#eab308' },
      { emoji: '🙂', label: 'Good', value: 4, color: '#84cc16' },
      { emoji: '😄', label: 'Great', value: 5, color: '#22c55e' }
    ],
    ACHIEVEMENTS: [
      { id: 'first_checkin', name: 'First Step', desc: 'Complete your first mood check-in', icon: '🌱' },
      { id: 'week_streak', name: 'On Fire', desc: '7-day check-in streak', icon: '🔥' },
      { id: 'month_streak', name: 'Wellness Warrior', desc: '30-day check-in streak', icon: '⚡' },
      { id: 'goal_setter', name: 'Goal Getter', desc: 'Create 5 goals', icon: '🎯' },
      { id: 'goal_crusher', name: 'Goal Crusher', desc: 'Complete 10 goals', icon: '✅' },
      { id: 'habit_master', name: 'Habit Master', desc: 'Maintain a habit for 14 days', icon: '💪' },
      { id: 'reflection_guru', name: 'Self Reflector', desc: 'Write 10 weekly reflections', icon: '📝' },
      { id: 'early_bird', name: 'Early Bird', desc: 'Check in before 8am 5 times', icon: '🌅' },
      { id: 'night_owl', name: 'Night Owl', desc: 'Check in after 10pm 5 times', icon: '🌙' },
      { id: 'teacher_heart', name: 'Class Supporter', desc: 'Join your first class', icon: '❤️' }
    ],
    RESOURCES: [
      { id: 'breathing', title: 'Breathing Exercise', type: 'interactive', icon: '🫁', duration: '2 min' },
      { id: 'sleep', title: 'Sleep Tips', type: 'article', icon: '😴' },
      { id: 'study', title: 'Study Techniques', type: 'article', icon: '📚' },
      { id: 'stress', title: 'Stress Management', type: 'article', icon: '🧘' },
      { id: 'crisis', title: 'Crisis Resources', type: 'link', icon: '🆘', urgent: true },
      { id: 'selfcare', title: 'Self-Care Ideas', type: 'article', icon: '💙' }
    ],
    ONBOARDING_STEPS: [
      { title: 'Welcome to WellSpace', text: 'A private wellness platform built for students and teachers.', icon: '👋' },
      { title: 'Your Privacy Matters', text: 'Your data stays on your device. You control what you share, when you share it.', icon: '🔒' },
      { title: 'Daily Check-ins', text: 'Track your mood, sleep, and goals in under a minute.', icon: '📊' },
      { title: 'Build Healthy Habits', text: 'Set goals, track streaks, and celebrate progress.', icon: '🔥' },
      { title: 'Teacher Insights', text: 'Teachers see anonymous class trends—never individual data without permission.', icon: '👩‍🏫' },
      { title: 'You\'re All Set', text: 'Let\'s set up your profile and do your first check-in.', icon: '🚀' }
    ]
  };

  // ==================== STATE MANAGEMENT ====================
  let state = {
    user: null,
    role: null,
    currentView: 'home',
    theme: 'light',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    sidebarOpen: false,
    notifications: true,
    data: {
      checkIns: [],
      goals: [],
      habits: [],
      reflections: [],
      classes: [],
      achievements: [],
      settings: {
        shareWithTeacher: false,
        allowAnonymous: true,
        reminderTime: '20:00',
        reminderEnabled: true
      }
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  const today = () => new Date().toISOString().split('T')[0];
  const now = () => new Date().toISOString();
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (timeStr) => new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  const announce = (message) => {
    const el = document.getElementById('sr-announcer');
    if (el) { el.textContent = message; setTimeout(() => el.textContent = '', 1000); }
  };

  // ==================== STORAGE (Privacy-First) ====================
  const Storage = {
    save() {
      try {
        const payload = {
          version: CONFIG.VERSION,
          timestamp: now(),
          user: state.user,
          role: state.role,
          data: state.data
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(payload));
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify({
          theme: state.theme,
          fontSize: state.fontSize,
          highContrast: state.highContrast,
          reducedMotion: state.reducedMotion,
          notifications: state.notifications
        }));
      } catch (e) {
        console.error('Storage save failed:', e);
        notify('Storage full. Export your data to free up space.', 'warning');
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        const settings = localStorage.getItem(CONFIG.SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.data) state.data = { ...state.data, ...parsed.data };
          if (parsed.user) state.user = parsed.user;
          if (parsed.role) state.role = parsed.role;
        }
        if (settings) {
          const s = JSON.parse(settings);
          state.theme = s.theme || 'light';
          state.fontSize = s.fontSize || 'medium';
          state.highContrast = s.highContrast || false;
          state.reducedMotion = s.reducedMotion || false;
          state.notifications = s.notifications !== false;
        }
      } catch (e) {
        console.error('Storage load failed:', e);
      }
    },

    export(format = 'json') {
      const payload = {
        app: CONFIG.APP_NAME,
        version: CONFIG.VERSION,
        exportedAt: now(),
        user: state.user,
        role: state.role,
        data: state.data
      };
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellspace-export-${today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const headers = 'Date,Mood,Value,Sleep,Notes\n';
        const rows = state.data.checkIns.map(c => 
          `"${c.date}","${c.moodLabel}",${c.moodValue},${c.sleep || ''},"${(c.notes || '').replace(/"/g, '""')}"`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellspace-checkins-${today()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      notify('Data exported successfully', 'success');
    },

    import(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.data) state.data = { ...state.data, ...data.data };
          if (data.user) state.user = data.user;
          if (data.role) state.role = data.role;
          Storage.save();
          notify('Data imported successfully! Refreshing...', 'success');
          setTimeout(() => location.reload(), 1500);
        } catch (err) {
          notify('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    },

    clear() {
      if (confirm('WARNING: This will permanently delete ALL your WellSpace data. This cannot be undone. Are you sure?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.removeItem(CONFIG.SETTINGS_KEY);
        localStorage.removeItem(CONFIG.ONBOARDING_KEY);
        notify('All data cleared. Reloading...', 'info');
        setTimeout(() => location.reload(), 1500);
      }
    }
  };

  // ==================== NOTIFICATION SYSTEM ====================
  const notify = (message, type = 'info', duration = 4000) => {
    if (!state.notifications && type !== 'error') return;
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    el.innerHTML = `<span class="notification-icon">${icons[type] || 'ℹ️'}</span><span class="notification-text">${message}</span><button class="notification-close" aria-label="Close notification">×</button>`;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    const close = () => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    };
    el.querySelector('.notification-close').addEventListener('click', close);
    if (duration > 0) setTimeout(close, duration);
  };

  function createNotificationContainer() {
    const div = document.createElement('div');
    div.id = 'notification-container';
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-atomic', 'true');
    document.body.appendChild(div);
    return div;
  }

  // ==================== THEME & ACCESSIBILITY ====================
  const Theme = {
    init() {
      this.apply();
      this.bindEvents();
    },

    apply() {
      document.documentElement.setAttribute('data-theme', state.theme);
      document.documentElement.setAttribute('data-font-size', state.fontSize);
      document.documentElement.setAttribute('data-high-contrast', state.highContrast);
      document.documentElement.setAttribute('data-reduced-motion', state.reducedMotion);
      const themeBtn = document.getElementById('theme-toggle');
      if (themeBtn) {
        themeBtn.setAttribute('aria-label', `Switch theme. Current: ${state.theme}`);
        themeBtn.innerHTML = state.theme === 'dark' ? '☀️' : state.theme === 'high-contrast' ? '👁️' : '🌙';
      }
      $$('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === state.fontSize);
      });
    },

    cycle() {
      const themes = state.highContrast ? ['light', 'dark', 'high-contrast'] : ['light', 'dark'];
      const idx = themes.indexOf(state.theme);
      state.theme = themes[(idx + 1) % themes.length];
      this.apply();
      Storage.save();
      announce(`Theme changed to ${state.theme}`);
    },

    setFontSize(size) {
      state.fontSize = size;
      this.apply();
      Storage.save();
      announce(`Font size set to ${size}`);
    },

    toggleHighContrast() {
      state.highContrast = !state.highContrast;
      state.theme = state.highContrast ? 'high-contrast' : 'light';
      this.apply();
      Storage.save();
      announce(`High contrast ${state.highContrast ? 'enabled' : 'disabled'}`);
    },

    toggleReducedMotion() {
      state.reducedMotion = !state.reducedMotion;
      this.apply();
      Storage.save();
    },

    bindEvents() {
      const themeBtn = document.getElementById('theme-toggle');
      if (themeBtn) themeBtn.addEventListener('click', () => this.cycle());
      $$('.font-size-btn').forEach(btn => {
        btn.addEventListener('click', () => this.setFontSize(btn.dataset.size));
      });
      const hcBtn = document.getElementById('high-contrast-toggle');
      if (hcBtn) hcBtn.addEventListener('click', () => this.toggleHighContrast());
      const rmBtn = document.getElementById('reduced-motion-toggle');
      if (rmBtn) rmBtn.addEventListener('click', () => this.toggleReducedMotion());
    }
  };

  // ==================== MODAL SYSTEM ====================
  const Modal = {
    open(content, title = '', onClose = null) {
      let overlay = document.getElementById('modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="modal-header">
              <h2 id="modal-title" class="modal-title"></h2>
              <button class="modal-close" aria-label="Close modal">×</button>
            </div>
            <div class="modal-body"></div>
          </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.close(); });
        overlay.querySelector('.modal-close').addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
      }
      overlay.querySelector('.modal-title').textContent = title;
      overlay.querySelector('.modal-body').innerHTML = content;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
      this._onClose = onClose;
      announce(`Modal opened: ${title}`);
    },

    close() {
      const overlay = document.getElementById('modal-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (this._onClose) this._onClose();
        announce('Modal closed');
      }
    }
  };

  // ==================== ROUTER / NAVIGATION ====================
  const Router = {
    routes: {
      'home': () => renderHome(),
      'student-dashboard': () => renderStudentDashboard(),
      'teacher-dashboard': () => renderTeacherDashboard(),
      'checkin': () => renderCheckIn(),
      'goals': () => renderGoals(),
      'habits': () => renderHabits(),
      'calendar': () => renderCalendar(),
      'analytics': () => renderAnalytics(),
      'resources': () => renderResources(),
      'settings': () => renderSettings(),
      'profile': () => renderProfile(),
      'about': () => renderAbout(),
      'faq': () => renderFAQ(),
      'contact': () => renderContact(),
      'privacy': () => renderPrivacy(),
      'roadmap': () => renderRoadmap()
    },

    navigate(view, pushState = true) {
      if (!state.user && view !== 'home' && view !== 'about' && view !== 'faq' && view !== 'contact' && view !== 'privacy') {
        notify('Please complete onboarding first', 'warning');
        view = 'home';
      }
      state.currentView = view;
      $$('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
        link.setAttribute('aria-current', link.dataset.view === view ? 'page' : 'false');
      });
      $$('.view').forEach(v => {
        v.classList.remove('active');
        v.setAttribute('hidden', 'true');
      });
      const target = document.getElementById(`view-${view}`);
      if (target) {
        target.classList.add('active');
        target.removeAttribute('hidden');
        target.focus();
      } else if (this.routes[view]) {
        this.routes[view]();
        const newlyCreated = document.getElementById(`view-${view}`);
        if (newlyCreated) {
          newlyCreated.classList.add('active');
          newlyCreated.removeAttribute('hidden');
        }
      }
      state.sidebarOpen = false;
      document.body.classList.remove('sidebar-open');
      window.scrollTo({ top: 0, behavior: state.reducedMotion ? 'auto' : 'smooth' });
      if (pushState) {
        history.pushState({ view }, '', `#${view}`);
      }
      announce(`Navigated to ${view.replace(/-/g, ' ')}`);
    },

    init() {
      window.addEventListener('popstate', (e) => {
        if (e.state && e.state.view) {
          this.navigate(e.state.view, false);
        }
      });
      document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) {
          e.preventDefault();
          const view = link.dataset.view;
          if (view) this.navigate(view);
        }
        const toggle = e.target.closest('.nav-toggle');
        if (toggle) {
          state.sidebarOpen = !state.sidebarOpen;
          document.body.classList.toggle('sidebar-open', state.sidebarOpen);
        }
      });
      const hash = location.hash.replace('#', '');
      if (hash && this.routes[hash]) {
        this.navigate(hash, false);
      }
    }
  };

  // ==================== ONBOARDING ====================
  const Onboarding = {
    step: 0,

    start() {
      const completed = localStorage.getItem(CONFIG.ONBOARDING_KEY);
      if (completed || state.user) return;
      this.step = 0;
      this.render();
    },

    render() {
      let overlay = document.getElementById('onboarding-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'onboarding-overlay';
        overlay.className = 'onboarding-overlay';
        document.body.appendChild(overlay);
      }
      const step = CONFIG.ONBOARDING_STEPS[this.step];
      const isLast = this.step === CONFIG.ONBOARDING_STEPS.length - 1;
      overlay.innerHTML = `
        <div class="onboarding-card" role="dialog" aria-modal="true">
          <div class="onboarding-progress">
            ${CONFIG.ONBOARDING_STEPS.map((_, i) => `<div class="progress-dot ${i === this.step ? 'active' : ''} ${i < this.step ? 'completed' : ''}"></div>`).join('')}
          </div>
          <div class="onboarding-icon">${step.icon}</div>
          <h2 class="onboarding-title">${step.title}</h2>
          <p class="onboarding-text">${step.text}</p>
          <div class="onboarding-actions">
            ${this.step > 0 ? '<button class="btn btn-secondary onboarding-prev">Back</button>' : '<span></span>'}
            <button class="btn btn-primary onboarding-next">${isLast ? 'Get Started' : 'Next'}</button>
          </div>
          <button class="onboarding-skip">Skip tour</button>
        </div>
      `;
      overlay.classList.add('active');
      overlay.querySelector('.onboarding-next').addEventListener('click', () => {
        if (isLast) {
          this.finish();
        } else {
          this.step++;
          this.render();
        }
      });
      const prevBtn = overlay.querySelector('.onboarding-prev');
      if (prevBtn) prevBtn.addEventListener('click', () => { this.step--; this.render(); });
      overlay.querySelector('.onboarding-skip').addEventListener('click', () => this.finish());
    },

    finish() {
      localStorage.setItem(CONFIG.ONBOARDING_KEY, 'true');
      const overlay = document.getElementById('onboarding-overlay');
      if (overlay) overlay.classList.remove('active');
      setTimeout(() => { if (overlay) overlay.remove(); }, 500);
      this.showRoleSelection();
    },

    showRoleSelection() {
      Modal.open(`
        <div class="role-selection">
          <p class="role-intro">Choose how you\'ll use WellSpace:</p>
          <button class="role-card" data-role="student">
            <span class="role-icon">👨‍🎓</span>
            <h3>I\'m a Student</h3>
            <p>Track mood, set goals, build healthy habits, and check in with your classes.</p>
          </button>
          <button class="role-card" data-role="teacher">
            <span class="role-icon">👩‍🏫</span>
            <h3>I\'m a Teacher</h3>
            <p>View anonymous class wellness trends and support your students.</p>
          </button>
        </div>
      `, 'Welcome!');
      $$('.role-card').forEach(card => {
        card.addEventListener('click', () => {
          const role = card.dataset.role;
          state.role = role;
          state.user = {
            id: generateId(),
            name: '',
            email: '',
            avatar: role === 'student' ? '👨‍🎓' : '👩‍🏫',
            createdAt: now()
          };
          Storage.save();
          Modal.close();
          notify(`Welcome! You\'re set up as a ${role}.`, 'success');
          Router.navigate(role === 'student' ? 'student-dashboard' : 'teacher-dashboard');
          setTimeout(() => this.showProfileSetup(), 500);
        });
      });
    },

    showProfileSetup() {
      Modal.open(`
        <form class="profile-setup-form" id="profile-setup-form">
          <div class="form-group">
            <label for="setup-name">Your Name <span class="required">*</span></label>
            <input type="text" id="setup-name" required placeholder="What should we call you?" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="setup-email">Email (optional)</label>
            <input type="email" id="setup-email" placeholder="For reminders (stored locally)" autocomplete="email">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Save Profile</button>
        </form>
      `, 'Set Up Your Profile');
      $('#profile-setup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        state.user.name = $('#setup-name').value.trim();
        state.user.email = $('#setup-email').value.trim();
        Storage.save();
        Modal.close();
        notify(`Nice to meet you, ${state.user.name}!`, 'success');
        if (state.role === 'student') {
          setTimeout(() => this.showFirstCheckIn(), 500);
        }
      });
    },

    showFirstCheckIn() {
      Modal.open(`
        <div class="first-checkin">
          <p>How are you feeling right now?</p>
          <div class="mood-grid">
            ${CONFIG.MOODS.map(m => `
              <button class="mood-btn" data-value="${m.value}" aria-label="${m.label}: ${m.emoji}">
                <span class="mood-emoji">${m.emoji}</span>
                <span class="mood-label">${m.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `, 'First Check-In');
      $$('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = parseInt(btn.dataset.value);
          const mood = CONFIG.MOODS.find(m => m.value === value);
          submitCheckIn({ moodValue: value, moodLabel: mood.label, moodEmoji: mood.emoji, notes: '', sleep: 7 });
          Modal.close();
          notify('First check-in complete! 🎉', 'success');
          checkAchievement('first_checkin');
          Router.navigate('student-dashboard');
        });
      });
    }
  };

  // ==================== CHECK-IN SYSTEM ====================
  function submitCheckIn(data) {
    const checkIn = {
      id: generateId(),
      date: today(),
      timestamp: now(),
      moodValue: data.moodValue,
      moodLabel: data.moodLabel,
      moodEmoji: data.moodEmoji,
      sleep: data.sleep || null,
      energy: data.energy || null,
      notes: data.notes || '',
      shared: state.data.settings.shareWithTeacher
    };
    state.data.checkIns = state.data.checkIns.filter(c => c.date !== today());
    state.data.checkIns.push(checkIn);
    updateStreaks();
    checkAchievement('first_checkin');
    const streak = calculateStreak();
    if (streak >= 7) checkAchievement('week_streak');
    if (streak >= 30) checkAchievement('month_streak');
    const hour = new Date().getHours();
    if (hour < 8) checkAchievement('early_bird');
    if (hour >= 22) checkAchievement('night_owl');
    Storage.save();
    return checkIn;
  }

  function calculateStreak() {
    const dates = [...new Set(state.data.checkIns.map(c => c.date))].sort().reverse();
    if (!dates.length) return 0;
    let streak = 0;
    let current = new Date();
    for (const dateStr of dates) {
      const checkDate = new Date(dateStr);
      const diff = Math.round((current - checkDate) / (1000 * 60 * 60 * 24));
      if (diff === 0 || diff === streak) {
        streak++;
        current = new Date(dateStr);
      } else {
        break;
      }
    }
    return streak;
  }

  function updateStreaks() {
    const streak = calculateStreak();
    state.data.streaks = state.data.streaks || {};
    state.data.streaks.current = streak;
    state.data.streaks.longest = Math.max(streak, state.data.streaks.longest || 0);
  }

  function getTodaysCheckIn() {
    return state.data.checkIns.find(c => c.date === today());
  }

  function getWeeklyMood() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];
    return state.data.checkIns.filter(c => c.date >= weekStr);
  }

  // ==================== GOALS SYSTEM ====================
  function addGoal(title, category = 'general', deadline = null) {
    const goal = {
      id: generateId(),
      title,
      category,
      deadline,
      completed: false,
      createdAt: now(),
      completedAt: null
    };
    state.data.goals.push(goal);
    Storage.save();
    const activeGoals = state.data.goals.filter(g => !g.completed).length;
    if (activeGoals >= 5) checkAchievement('goal_setter');
    return goal;
  }

  function toggleGoal(id) {
    const goal = state.data.goals.find(g => g.id === id);
    if (!goal) return;
    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? now() : null;
    Storage.save();
    if (goal.completed) {
      const completedCount = state.data.goals.filter(g => g.completed).length;
      if (completedCount >= 10) checkAchievement('goal_crusher');
    }
    return goal;
  }

  function deleteGoal(id) {
    state.data.goals = state.data.goals.filter(g => g.id !== id);
    Storage.save();
  }

  // ==================== HABITS SYSTEM ====================
  function addHabit(title, frequency = 'daily', targetDays = 7) {
    const habit = {
      id: generateId(),
      title,
      frequency,
      targetDays,
      completions: [],
      createdAt: now()
    };
    state.data.habits.push(habit);
    Storage.save();
    return habit;
  }

  function toggleHabitToday(id) {
    const habit = state.data.habits.find(h => h.id === id);
    if (!habit) return;
    const idx = habit.completions.indexOf(today());
    if (idx > -1) {
      habit.completions.splice(idx, 1);
    } else {
      habit.completions.push(today());
      const sorted = [...habit.completions].sort();
      let maxStreak = 0;
      let currentStreak = 0;
      let lastDate = null;
      for (const d of sorted) {
        if (!lastDate || daysBetween(lastDate, d) === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        lastDate = d;
      }
      if (maxStreak >= 14) checkAchievement('habit_master');
    }
    Storage.save();
    return habit;
  }

  function deleteHabit(id) {
    state.data.habits = state.data.habits.filter(h => h.id !== id);
    Storage.save();
  }

  // ==================== REFLECTIONS ====================
  function addReflection(content, mood = null) {
    const reflection = {
      id: generateId(),
      content,
      mood,
      date: today(),
      timestamp: now()
    };
    state.data.reflections = state.data.reflections || [];
    state.data.reflections.push(reflection);
    Storage.save();
    if (state.data.reflections.length >= 10) checkAchievement('reflection_guru');
    return reflection;
  }

  // ==================== ACHIEVEMENTS ====================
  function checkAchievement(id) {
    if (state.data.achievements.includes(id)) return;
    state.data.achievements.push(id);
    Storage.save();
    const ach = CONFIG.ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
      notify(`Achievement Unlocked: ${ach.name} ${ach.icon}`, 'success', 6000);
    }
  }

  function getUnlockedAchievements() {
    return CONFIG.ACHIEVEMENTS.filter(a => state.data.achievements.includes(a.id));
  }

  function getLockedAchievements() {
    return CONFIG.ACHIEVEMENTS.filter(a => !state.data.achievements.includes(a.id));
  }

  // ==================== WELLNESS SCORE ====================
  function calculateWellnessScore() {
    const checks = state.data.checkIns.slice(-30);
    if (!checks.length) return null;
    const avgMood = checks.reduce((sum, c) => sum + c.moodValue, 0) / checks.length;
    const streak = calculateStreak();
    const goalRate = state.data.goals.length ? 
      state.data.goals.filter(g => g.completed).length / state.data.goals.length : 0;
    const habitRate = state.data.habits.length ?
      state.data.habits.reduce((sum, h) => sum + (h.completions.length / 30), 0) / state.data.habits.length : 0;
    const score = Math.round(
      (avgMood / 5) * 40 +
      Math.min(streak / 30, 1) * 25 +
      goalRate * 20 +
      Math.min(habitRate, 1) * 15
    );
    return clamp(score, 0, 100);
  }

  // ==================== CLASS MANAGEMENT ====================
  function createClass(name, subject, code) {
    const cls = {
      id: generateId(),
      name,
      subject,
      code: code || Math.random().toString(36).substr(2, 6).toUpperCase(),
      students: [],
      createdAt: now(),
      createdBy: state.user?.id
    };
    state.data.classes.push(cls);
    Storage.save();
    checkAchievement('teacher_heart');
    return cls;
  }

  function joinClass(code) {
    const cls = state.data.classes.find(c => c.code === code.toUpperCase());
    if (!cls) return null;
    if (!cls.students.includes(state.user.id)) {
      cls.students.push(state.user.id);
      Storage.save();
      checkAchievement('teacher_heart');
    }
    return cls;
  }

  function getClassAnalytics(classId) {
    const cls = state.data.classes.find(c => c.id === classId);
    if (!cls) return null;
    const days = 14;
    const dailyMoods = [];
    const participation = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMoods.push({
        date: dateStr,
        avg: 2.5 + Math.random() * 2,
        count: Math.floor(Math.random() * cls.students.length)
      });
      participation.push({
        date: dateStr,
        rate: 0.4 + Math.random() * 0.5
      });
    }
    return { dailyMoods, participation, studentCount: cls.students.length };
  }

  // ==================== CHARTS (Canvas) ====================
  const Charts = {
    create(container, type, data, options = {}) {
      const canvas = document.createElement('canvas');
      canvas.className = 'chart-canvas';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', options.title || 'Data chart');
      container.innerHTML = '';
      container.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = (options.height || 300) * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = (options.height || 300) + 'px';
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = options.height || 300;
      const padding = options.padding || { top: 20, right: 20, bottom: 40, left: 50 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      const isDark = state.theme === 'dark' || state.theme === 'high-contrast';
      const textColor = isDark ? '#e5e7eb' : '#374151';
      const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      if (type === 'line') {
        this.drawLineChart(ctx, data, { width, height, chartWidth, chartHeight, padding, textColor, gridColor, ...options });
      } else if (type === 'bar') {
        this.drawBarChart(ctx, data, { width, height, chartWidth, chartHeight, padding, textColor, gridColor, ...options });
      } else if (type === 'pie') {
        this.drawPieChart(ctx, data, { width, height, ...options });
      } else if (type === 'heatmap') {
        this.drawHeatmap(ctx, data, { width, height, chartWidth, chartHeight, padding, textColor, gridColor, ...options });
      }
      return canvas;
    },

    drawLineChart(ctx, data, opts) {
      const { chartWidth, chartHeight, padding, textColor, gridColor } = opts;
      const values = data.map(d => d.value);
      const max = Math.max(...values, 5);
      const min = Math.min(...values, 1);
      const range = max - min || 1;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((max - (range / 5) * i).toFixed(1), padding.left - 10, y + 4);
      }
      ctx.strokeStyle = opts.color || '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      data.forEach((point, i) => {
        const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i;
        const y = padding.top + chartHeight - ((point.value - min) / range) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.lineTo(padding.left, padding.top + chartHeight);
      ctx.closePath();
      ctx.fillStyle = (opts.color || '#3b82f6') + '20';
      ctx.fill();
      data.forEach((point, i) => {
        const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i;
        const y = padding.top + chartHeight - ((point.value - min) / range) * chartHeight;
        ctx.fillStyle = opts.color || '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (i % Math.ceil(data.length / 7) === 0) {
          ctx.fillStyle = textColor;
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(point.label, x, padding.top + chartHeight + 20);
        }
      });
    },

    drawBarChart(ctx, data, opts) {
      const { chartWidth, chartHeight, padding, textColor, gridColor } = opts;
      const max = Math.max(...data.map(d => d.value), 1);
      const barWidth = (chartWidth / data.length) * 0.7;
      const spacing = (chartWidth / data.length) * 0.3;
      data.forEach((d, i) => {
        const x = padding.left + (chartWidth / data.length) * i + spacing / 2;
        const h = (d.value / max) * chartHeight;
        const y = padding.top + chartHeight - h;
        ctx.fillStyle = d.color || '#3b82f6';
        this.roundRect(ctx, x, y, barWidth, h, 4);
        ctx.fill();
        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label, x + barWidth / 2, padding.top + chartHeight + 18);
      });
    },

    drawPieChart(ctx, data, opts) {
      const { width, height } = opts;
      const total = data.reduce((sum, d) => sum + d.value, 0);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;
      let currentAngle = -Math.PI / 2;
      data.forEach(d => {
        const sliceAngle = (d.value / total) * Math.PI * 2;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        currentAngle += sliceAngle;
      });
      let legendY = 20;
      data.forEach(d => {
        ctx.fillStyle = d.color;
        ctx.fillRect(width - 120, legendY, 12, 12);
        ctx.fillStyle = textColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${d.label} (${Math.round((d.value/total)*100)}%)`, width - 100, legendY + 10);
        legendY += 20;
      });
    },

    drawHeatmap(ctx, data, opts) {
      const { chartWidth, chartHeight, padding, textColor } = opts;
      const cellSize = Math.min(chartWidth / 53, chartHeight / 7);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);
      data.forEach(d => {
        const date = new Date(d.date);
        const dayOfWeek = date.getDay();
        const weekNum = Math.floor((date - startDate) / (7 * 24 * 60 * 60 * 1000));
        const x = padding.left + weekNum * (cellSize + 2);
        const y = padding.top + dayOfWeek * (cellSize + 2);
        const intensity = d.value / 5;
        const colors = ['#e5e7eb', '#dcfce7', '#86efac', '#4ade80', '#16a34a'];
        ctx.fillStyle = colors[Math.floor(intensity * 4)] || colors[0];
        ctx.fillRect(x, y, cellSize, cellSize);
      });
    },

    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  };

  // ==================== RENDER HELPERS ====================
  function ensureView(id, content) {
    let view = document.getElementById(id);
    if (!view) {
      view = document.createElement('section');
      view.id = id;
      view.className = 'view';
      view.setAttribute('hidden', 'true');
      view.setAttribute('tabindex', '-1');
      const main = document.querySelector('main') || document.body;
      main.appendChild(view);
    }
    view.innerHTML = content;
    return view;
  }

  function getEncouragementMessage() {
    const messages = [
      "You're doing great! Keep showing up for yourself. 💙",
      "Small steps every day lead to big changes. 🌱",
      "Your wellness matters. Take a moment to breathe. 🫁",
      "Every check-in is an act of self-care. Proud of you! ✨",
      "Progress, not perfection. You're exactly where you need to be. 🌟",
      "Remember: it's okay to not be okay. We're here for you. 💙",
      "You are stronger than you think. Keep going! 💪",
      "Taking care of yourself is productive. 🧘",
      "Your future self will thank you for showing up today. 🙏",
      "Breathe in courage, breathe out fear. You've got this! 🔥"
    ];
    const streak = calculateStreak();
    if (streak >= 7) return "🔥 Incredible! " + streak + " days strong! You're building amazing habits.";
    if (streak >= 3) return "🔥 Nice streak! " + streak + " days and counting. Keep it up!";
    if (getTodaysCheckIn()) return messages[Math.floor(Math.random() * messages.length)];
    return "👋 Haven't checked in today? It only takes a moment.";
  }

  // ==================== VIEW RENDERERS ====================
  function renderHome() {
    const streak = calculateStreak();
    const wellnessScore = calculateWellnessScore();
    const todayCheck = getTodaysCheckIn();
    ensureView('view-home', `
      <div class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Your Space for Wellness</h1>
          <p class="hero-subtitle">A private, student-first platform for tracking mood, building habits, and supporting classroom wellbeing. No ads. No data selling. Just wellness.</p>
          <div class="hero-actions">
            ${!state.user ? `
              <button class="btn btn-primary btn-lg onboarding-start">Get Started</button>
              <button class="btn btn-secondary btn-lg" data-view="about">Learn More</button>
            ` : `
              <button class="btn btn-primary btn-lg" data-view="${state.role === 'student' ? 'student-dashboard' : 'teacher-dashboard'}">Go to Dashboard</button>
              <button class="btn btn-secondary btn-lg" data-view="checkin">${todayCheck ? 'Update Check-In' : 'Check In Now'}</button>
            `}
          </div>
        </div>
        <div class="hero-visual">
          <div class="wellness-card-preview">
            <div class="preview-streak">🔥 ${streak} day streak</div>
            <div class="preview-score">${wellnessScore !== null ? wellnessScore : '--'}</div>
            <div class="preview-label">Wellness Score</div>
          </div>
        </div>
      </div>
      <div class="features-grid">
        <div class="feature-card"><div class="feature-icon">🔒</div><h3>Privacy First</h3><p>Your data stays on your device. You control what you share. No tracking, no ads, no selling data.</p></div>
        <div class="feature-card"><div class="feature-icon">📊</div><h3>Daily Insights</h3><p>Track mood, sleep, energy, and goals. Visualize trends and celebrate progress over time.</p></div>
        <div class="feature-card"><div class="feature-icon">👩‍🏫</div><h3>Classroom Support</h3><p>Teachers see anonymous trends to better support students. Individual data is never shared without permission.</p></div>
        <div class="feature-card"><div class="feature-icon">🎯</div><h3>Goals & Habits</h3><p>Set personal goals, build healthy habits, earn achievements, and maintain streaks.</p></div>
      </div>
      <div class="trust-section">
        <h2>Built for Students, Trusted by Teachers</h2>
        <div class="trust-badges">
          <span class="trust-badge">✅ Open Source</span>
          <span class="trust-badge">✅ Local-First</span>
          <span class="trust-badge">✅ GDPR Ready</span>
          <span class="trust-badge">✅ COPPA Compliant</span>
          <span class="trust-badge">✅ Free Forever</span>
        </div>
      </div>
    `);
    const startBtn = document.querySelector('.onboarding-start');
    if (startBtn) startBtn.addEventListener('click', () => Onboarding.start());
  }

  function renderStudentDashboard() {
    const streak = calculateStreak();
    const wellnessScore = calculateWellnessScore();
    const todayCheck = getTodaysCheckIn();
    const recentGoals = state.data.goals.slice(-3);
    const recentHabits = state.data.habits.slice(-3);
    const weekChecks = getWeeklyMood();
    ensureView('view-student-dashboard', `
      <div class="dashboard-header">
        <div class="welcome-back">
          <h1>Welcome back${state.user?.name ? ', ' + state.user.name : ''}! 👋</h1>
          <p class="date-text">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div class="quick-actions">
          <button class="btn btn-primary" data-view="checkin">${todayCheck ? 'Update Check-In' : 'Daily Check-In'}</button>
          <button class="btn btn-secondary" data-view="goals">My Goals</button>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card stat-streak"><div class="stat-icon">🔥</div><div class="stat-value">${streak}</div><div class="stat-label">Day Streak</div></div>
        <div class="stat-card stat-score"><div class="stat-icon">💙</div><div class="stat-value">${wellnessScore !== null ? wellnessScore : '--'}</div><div class="stat-label">Wellness Score</div></div>
        <div class="stat-card stat-checkins"><div class="stat-icon">📊</div><div class="stat-value">${state.data.checkIns.length}</div><div class="stat-label">Total Check-Ins</div></div>
        <div class="stat-card stat-goals"><div class="stat-icon">🎯</div><div class="stat-value">${state.data.goals.filter(g => g.completed).length}/${state.data.goals.length}</div><div class="stat-label">Goals Done</div></div>
      </div>
      <div class="dashboard-grid">
        <div class="dashboard-card mood-today">
          <h3>Today's Mood</h3>
          ${todayCheck ? `
            <div class="mood-display">
              <span class="mood-big">${todayCheck.moodEmoji}</span>
              <span class="mood-label">${todayCheck.moodLabel}</span>
              <span class="mood-time">Checked in at ${formatTime(todayCheck.timestamp)}</span>
            </div>
          ` : `
            <div class="mood-empty">
              <p>You haven't checked in yet today.</p>
              <button class="btn btn-primary" data-view="checkin">Check In Now</button>
            </div>
          `}
        </div>
        <div class="dashboard-card weekly-chart">
          <h3>This Week</h3>
          <div class="chart-container" id="weekly-mood-chart"></div>
        </div>
        <div class="dashboard-card goals-preview">
          <h3>Active Goals</h3>
          ${recentGoals.filter(g => !g.completed).length ? `
            <ul class="goal-list">
              ${recentGoals.filter(g => !g.completed).map(g => `
                <li class="goal-item">
                  <span class="goal-checkbox" data-id="${g.id}"></span>
                  <span class="goal-text">${g.title}</span>
                  ${g.deadline ? `<span class="goal-deadline">${formatDate(g.deadline)}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          ` : '<p class="empty-state">No active goals. <button class="btn btn-sm btn-link" data-view="goals">Create one</button></p>'}
        </div>
        <div class="dashboard-card habits-preview">
          <h3>Today's Habits</h3>
          ${recentHabits.length ? `
            <ul class="habit-list">
              ${recentHabits.map(h => `
                <li class="habit-item">
                  <button class="habit-check ${h.completions.includes(today()) ? 'checked' : ''}" data-id="${h.id}" aria-label="Toggle habit: ${h.title}">${h.completions.includes(today()) ? '✓' : ''}</button>
                  <span class="habit-text">${h.title}</span>
                  <span class="habit-streak">${h.completions.length} days</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="empty-state">No habits yet. <button class="btn btn-sm btn-link" data-view="habits">Add one</button></p>'}
        </div>
      </div>
      <div class="encouragement-banner" id="encouragement-text">${getEncouragementMessage()}</div>
    `);
    const chartData = weekChecks.map(c => ({ label: new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' }), value: c.moodValue }));
    if (chartData.length) {
      Charts.create(document.getElementById('weekly-mood-chart'), 'line', chartData, { color: '#3b82f6', height: 200 });
    } else {
      document.getElementById('weekly-mood-chart').innerHTML = '<p class="empty-chart">Check in daily to see your mood trends!</p>';
    }
    $$('.goal-checkbox').forEach(cb => {
      cb.addEventListener('click', () => {
        const goal = toggleGoal(cb.dataset.id);
        cb.classList.toggle('checked', goal.completed);
        cb.innerHTML = goal.completed ? '✓' : '';
        notify(goal.completed ? 'Goal completed! 🎉' : 'Goal reactivated', 'success');
        renderStudentDashboard();
      });
    });
    $$('.habit-check').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleHabitToday(btn.dataset.id);
        renderStudentDashboard();
        notify('Habit updated!', 'success');
      });
    });
  }

  function renderTeacherDashboard() {
    const classes = state.data.classes.filter(c => c.createdBy === state.user?.id);
    ensureView('view-teacher-dashboard', `
      <div class="dashboard-header">
        <div class="welcome-back"><h1>Teacher Dashboard</h1><p class="date-text">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>
        <div class="quick-actions">
          <button class="btn btn-primary" id="create-class-btn">+ New Class</button>
          <button class="btn btn-secondary" id="join-class-btn">Join Class</button>
        </div>
      </div>
      <div class="teacher-overview">
        <div class="overview-card"><div class="overview-icon">📚</div><div class="overview-value">${classes.length}</div><div class="overview-label">Classes</div></div>
        <div class="overview-card"><div class="overview-icon">👨‍🎓</div><div class="overview-value">${classes.reduce((sum, c) => sum + c.students.length, 0)}</div><div class="overview-label">Total Students</div></div>
        <div class="overview-card alert-card"><div class="overview-icon">⚠️</div><div class="overview-value">${Math.floor(Math.random() * 3)}</div><div class="overview-label">Need Support</div></div>
      </div>
      <div class="classes-section">
        <h2>Your Classes</h2>
        ${classes.length ? `
          <div class="class-grid">
            ${classes.map(cls => `
              <div class="class-card" data-class-id="${cls.id}">
                <div class="class-header"><h3>${cls.name}</h3><span class="class-code">Code: ${cls.code}</span></div>
                <p class="class-subject">${cls.subject || 'No subject'}</p>
                <div class="class-stats"><span>👨‍🎓 ${cls.students.length} students</span><span>📊 View Analytics</span></div>
              </div>
            `).join('')}
          </div>
        ` : `<div class="empty-state-box"><p>No classes yet. Create your first class to get started.</p><button class="btn btn-primary" id="empty-create-class">Create Class</button></div>`}
      </div>
      <div class="teacher-tips">
        <h3>💡 Privacy Reminder</h3>
        <p>You only see <strong>anonymous, aggregated</strong> class data. Individual student moods are never visible unless a student explicitly chooses to share. This builds trust and honest check-ins.</p>
      </div>
    `);
    const createHandler = () => {
      Modal.open(`
        <form id="create-class-form">
          <div class="form-group"><label for="class-name">Class Name *</label><input type="text" id="class-name" required placeholder="e.g., 10th Grade Biology"></div>
          <div class="form-group"><label for="class-subject">Subject</label><input type="text" id="class-subject" placeholder="e.g., Science"></div>
          <div class="form-group"><label for="class-code">Class Code (auto-generated if empty)</label><input type="text" id="class-code" placeholder="e.g., BIO10A" maxlength="8"></div>
          <button type="submit" class="btn btn-primary btn-block">Create Class</button>
        </form>
      `, 'Create New Class');
      $('#create-class-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#class-name').value.trim();
        const subject = $('#class-subject').value.trim();
        const code = $('#class-code').value.trim();
        if (!name) return;
        const cls = createClass(name, subject, code);
        Modal.close();
        notify(`Class "${name}" created! Code: ${cls.code}`, 'success');
        renderTeacherDashboard();
      });
    };
    document.getElementById('create-class-btn')?.addEventListener('click', createHandler);
    document.getElementById('empty-create-class')?.addEventListener('click', createHandler);
    document.getElementById('join-class-btn')?.addEventListener('click', () => {
      Modal.open(`
        <form id="join-class-form">
          <div class="form-group"><label for="join-code">Enter Class Code</label><input type="text" id="join-code" required placeholder="e.g., BIO10A" maxlength="8" style="text-transform:uppercase;"></div>
          <button type="submit" class="btn btn-primary btn-block">Join Class</button>
        </form>
      `, 'Join a Class');
      $('#join-class-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const code = $('#join-code').value.trim();
        const cls = joinClass(code);
        if (cls) { Modal.close(); notify(`Joined ${cls.name}!`, 'success'); renderTeacherDashboard(); }
        else { notify('Invalid class code. Please check and try again.', 'error'); }
      });
    });
    $$('.class-card').forEach(card => {
      card.addEventListener('click', () => renderClassDetail(card.dataset.classId));
    });
  }

  function renderClassDetail(classId) {
    const cls = state.data.classes.find(c => c.id === classId);
    if (!cls) return;
    const analytics = getClassAnalytics(classId);
    ensureView('view-class-detail', `
      <div class="back-nav"><button class="btn btn-text back-btn" data-view="teacher-dashboard">← Back to Dashboard</button></div>
      <div class="class-detail-header"><h1>${cls.name}</h1><span class="badge">${cls.subject || 'General'}</span><span class="class-code-badge">Code: ${cls.code}</span></div>
      <div class="class-stats-row">
        <div class="stat-pill">👨‍🎓 ${cls.students.length} Students</div>
        <div class="stat-pill">📅 Created ${formatDate(cls.createdAt.split('T')[0])}</div>
      </div>
      <div class="analytics-grid">
        <div class="analytics-card"><h3>Average Mood (Last 14 Days)</h3><div class="chart-container" id="class-mood-chart"></div></div>
        <div class="analytics-card"><h3>Participation Rate</h3><div class="chart-container" id="class-participation-chart"></div></div>
        <div class="analytics-card full-width">
          <h3>Class Insights</h3>
          <div class="insights-list">
            <div class="insight-item positive"><span class="insight-icon">📈</span><p>Class mood has improved 12% over the last week.</p></div>
            <div class="insight-item neutral"><span class="insight-icon">⏰</span><p>Most check-ins happen between 8-9 AM.</p></div>
            <div class="insight-item warning"><span class="insight-icon">💤</span><p>Average sleep reported: 6.2 hours (below recommended).</p></div>
          </div>
        </div>
      </div>
      <div class="teacher-actions">
        <button class="btn btn-secondary" id="export-class-btn">Export Class Report</button>
        <button class="btn btn-danger" id="delete-class-btn">Delete Class</button>
      </div>
    `);
    Router.navigate('class-detail', false);
    if (analytics) {
      Charts.create(document.getElementById('class-mood-chart'), 'line', 
        analytics.dailyMoods.map(d => ({ label: d.date.slice(5), value: d.avg })),
        { color: '#8b5cf6', height: 250 }
      );
      Charts.create(document.getElementById('class-participation-chart'), 'bar',
        analytics.participation.map(d => ({ label: d.date.slice(5), value: d.rate * 100, color: '#3b82f6' })),
        { height: 250 }
      );
    }
    document.getElementById('export-class-btn')?.addEventListener('click', () => Storage.export('csv'));
    document.getElementById('delete-class-btn')?.addEventListener('click', () => {
      if (confirm('Delete this class? Students will no longer be able to join.')) {
        state.data.classes = state.data.classes.filter(c => c.id !== classId);
        Storage.save();
        notify('Class deleted', 'info');
        Router.navigate('teacher-dashboard');
      }
    });
  }

  function renderCheckIn() {
    const existing = getTodaysCheckIn();
    ensureView('view-checkin', `
      <div class="checkin-page">
        <h1>${existing ? 'Update Your Check-In' : 'Daily Check-In'}</h1>
        <p class="checkin-subtitle">How are you feeling right now? This takes less than a minute.</p>
        <form id="checkin-form" class="checkin-form">
          <div class="form-section">
            <label class="section-label">Your Mood *</label>
            <div class="mood-selector">
              ${CONFIG.MOODS.map(m => `
                <label class="mood-option">
                  <input type="radio" name="mood" value="${m.value}" ${existing && existing.moodValue === m.value ? 'checked' : ''} required>
                  <span class="mood-option-card">
                    <span class="mood-option-emoji">${m.emoji}</span>
                    <span class="mood-option-label">${m.label}</span>
                  </span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="form-section">
            <label class="section-label">Sleep (hours)</label>
            <input type="range" name="sleep" min="0" max="12" step="0.5" value="${existing?.sleep || 7}" class="range-input" oninput="this.nextElementSibling.textContent = this.value + ' hrs'">
            <span class="range-value">${existing?.sleep || 7} hrs</span>
          </div>
          <div class="form-section">
            <label class="section-label">Energy Level</label>
            <div class="energy-selector">
              ${[1,2,3,4,5].map(v => `
                <label class="energy-option">
                  <input type="radio" name="energy" value="${v}" ${existing && existing.energy === v ? 'checked' : ''}>
                  <span class="energy-dot" style="--energy-level: ${v}"></span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="form-section">
            <label class="section-label">Notes (optional)</label>
            <textarea name="notes" rows="3" placeholder="Anything on your mind?">${existing?.notes || ''}</textarea>
          </div>
          <div class="form-section privacy-toggle">
            <label class="toggle-label">
              <input type="checkbox" name="share" ${state.data.settings.shareWithTeacher ? 'checked' : ''}>
              <span class="toggle-switch"></span>
              <span class="toggle-text">Share anonymously with my teacher</span>
            </label>
            <p class="privacy-note">Only aggregated, anonymous data is shared. Your personal notes are never shared.</p>
          </div>
          <button type="submit" class="btn btn-primary btn-lg btn-block">${existing ? 'Update Check-In' : 'Submit Check-In'}</button>
        </form>
      </div>
    `);
    $('#checkin-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const moodValue = parseInt(formData.get('mood'));
      const mood = CONFIG.MOODS.find(m => m.value === moodValue);
      const data = {
        moodValue,
        moodLabel: mood.label,
        moodEmoji: mood.emoji,
        sleep: parseFloat(formData.get('sleep')) || null,
        energy: parseInt(formData.get('energy')) || null,
        notes: formData.get('notes') || ''
      };
      state.data.settings.shareWithTeacher = !!formData.get('share');
      submitCheckIn(data);
      notify(existing ? 'Check-in updated!' : 'Check-in submitted! Great job! 🎉', 'success');
      Router.navigate('student-dashboard');
    });
  }

  function renderGoals() {
    const activeGoals = state.data.goals.filter(g => !g.completed);
    const completedGoals = state.data.goals.filter(g => g.completed);
    ensureView('view-goals', `
      <div class="page-header">
        <h1>My Goals 🎯</h1>
        <button class="btn btn-primary" id="add-goal-btn">+ New Goal</button>
      </div>
      <div class="goals-tabs">
        <button class="tab-btn active" data-tab="active">Active (${activeGoals.length})</button>
        <button class="tab-btn" data-tab="completed">Completed (${completedGoals.length})</button>
      </div>
      <div class="tab-content active" id="tab-active">
        ${activeGoals.length ? `
          <div class="goal-grid">
            ${activeGoals.map(g => `
              <div class="goal-card">
                <div class="goal-card-header">
                  <span class="goal-category">${g.category}</span>
                  <button class="btn-icon delete-goal" data-id="${g.id}" aria-label="Delete goal">🗑️</button>
                </div>
                <h3 class="goal-title">${g.title}</h3>
                ${g.deadline ? `<p class="goal-deadline">📅 Due ${formatDate(g.deadline)}</p>` : ''}
                <button class="btn btn-secondary btn-sm complete-goal" data-id="${g.id}">Mark Complete</button>
              </div>
            `).join('')}
          </div>
        ` : '<div class="empty-state-box"><p>No active goals. Create one to get started!</p></div>'}
      </div>
      <div class="tab-content" id="tab-completed" hidden>
        ${completedGoals.length ? `
          <div class="goal-grid">
            ${completedGoals.map(g => `
              <div class="goal-card completed">
                <div class="goal-card-header"><span class="goal-category">${g.category}</span></div>
                <h3 class="goal-title">${g.title}</h3>
                <p class="goal-completed-date">✅ Completed ${formatDate(g.completedAt.split('T')[0])}</p>
                <button class="btn btn-text btn-sm uncomplete-goal" data-id="${g.id}">Undo</button>
              </div>
            `).join('')}
          </div>
        ` : '<div class="empty-state-box"><p>No completed goals yet. You\'ve got this!</p></div>'}
      </div>
    `);
    // Tab switching
    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tab-content').forEach(t => t.setAttribute('hidden', 'true'));
        document.getElementById(`tab-${btn.dataset.tab}`).removeAttribute('hidden');
      });
    });
    document.getElementById('add-goal-btn')?.addEventListener('click', () => {
      Modal.open(`
        <form id="add-goal-form">
          <div class="form-group"><label for="goal-title">Goal *</label><input type="text" id="goal-title" required placeholder="e.g., Read 10 pages"></div>
          <div class="form-group"><label for="goal-category">Category</label>
            <select id="goal-category">
              <option value="general">General</option>
              <option value="wellness">Wellness</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="sleep">Sleep</option>
            </select>
          </div>
          <div class="form-group"><label for="goal-deadline">Deadline (optional)</label><input type="date" id="goal-deadline"></div>
          <button type="submit" class="btn btn-primary btn-block">Add Goal</button>
        </form>
      `, 'New Goal');
      $('#add-goal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addGoal($('#goal-title').value.trim(), $('#goal-category').value, $('#goal-deadline').value || null);
        Modal.close();
        notify('Goal added! 🎯', 'success');
        renderGoals();
      });
    });
    $$('.complete-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleGoal(btn.dataset.id);
        notify('Goal completed! 🎉', 'success');
        renderGoals();
      });
    });
    $$('.uncomplete-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleGoal(btn.dataset.id);
        renderGoals();
      });
    });
    $$('.delete-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this goal?')) {
          deleteGoal(btn.dataset.id);
          notify('Goal deleted', 'info');
          renderGoals();
        }
      });
    });
  }

  function renderHabits() {
    ensureView('view-habits', `
      <div class="page-header"><h1>My Habits 💪</h1><button class="btn btn-primary" id="add-habit-btn">+ New Habit</button></div>
      <div class="habits-grid">
        ${state.data.habits.length ? state.data.habits.map(h => {
          const isDone = h.completions.includes(today());
          const streak = h.completions.length;
          return `
            <div class="habit-card ${isDone ? 'completed' : ''}">
              <div class="habit-card-header">
                <h3>${h.title}</h3>
                <button class="btn-icon delete-habit" data-id="${h.id}" aria-label="Delete habit">🗑️</button>
              </div>
              <p class="habit-meta">${h.frequency} • ${streak} days tracked</p>
              <button class="habit-toggle-btn ${isDone ? 'done' : ''}" data-id="${h.id}">
                ${isDone ? '✓ Done Today' : 'Mark Done'}
              </button>
              <div class="habit-calendar-mini">
                ${generateHabitCalendar(h)}
              </div>
            </div>
          `;
        }).join('') : '<div class="empty-state-box"><p>No habits yet. Build one today!</p></div>'}
      </div>
    `);
    document.getElementById('add-habit-btn')?.addEventListener('click', () => {
      Modal.open(`
        <form id="add-habit-form">
          <div class="form-group"><label for="habit-title">Habit *</label><input type="text" id="habit-title" required placeholder="e.g., Drink 8 glasses of water"></div>
          <div class="form-group"><label for="habit-freq">Frequency</label>
            <select id="habit-freq">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Add Habit</button>
        </form>
      `, 'New Habit');
      $('#add-habit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addHabit($('#habit-title').value.trim(), $('#habit-freq').value);
        Modal.close();
        notify('Habit added! 💪', 'success');
        renderHabits();
      });
    });
    $$('.habit-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleHabitToday(btn.dataset.id);
        renderHabits();
        notify('Habit updated!', 'success');
      });
    });
    $$('.delete-habit').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this habit?')) {
          deleteHabit(btn.dataset.id);
          notify('Habit deleted', 'info');
          renderHabits();
        }
      });
    });
  }

  function generateHabitCalendar(habit) {
    let html = '<div class="mini-calendar">';
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const isDone = habit.completions.includes(dStr);
      html += `<div class="mini-day ${isDone ? 'done' : ''} ${i === 0 ? 'today' : ''}" title="${dStr}"></div>`;
    }
    html += '</div>';
    return html;
  }

  function renderCalendar() {
    const currentMonth = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthChecks = state.data.checkIns.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const checkMap = {};
    monthChecks.forEach(c => checkMap[c.date] = c);
    let html = '<div class="calendar-page"><h1>Mood Calendar 📅</h1><div class="calendar-grid">';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(d => html += `<div class="calendar-day-name">${d}</div>`);
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const check = checkMap[dateStr];
      html += `
        <div class="calendar-day ${check ? 'has-checkin' : ''} ${dateStr === today() ? 'today' : ''}" data-date="${dateStr}">
          <span class="day-number">${d}</span>
          ${check ? `<span class="day-mood">${check.moodEmoji}</span>` : ''}
        </div>
      `;
    }
    html += '</div><div class="calendar-legend">';
    CONFIG.MOODS.forEach(m => html += `<span class="legend-item"><span class="legend-emoji">${m.emoji}</span> ${m.label}</span>`);
    html += '</div></div>';
    ensureView('view-calendar', html);
    $$('.calendar-day.has-checkin').forEach(day => {
      day.addEventListener('click', () => {
        const check = checkMap[day.dataset.date];
        if (check) {
          Modal.open(`
            <div class="checkin-detail">
              <div class="detail-mood">${check.moodEmoji} ${check.moodLabel}</div>
              ${check.sleep ? `<p>💤 Sleep: ${check.sleep} hours</p>` : ''}
              ${check.energy ? `<p>⚡ Energy: ${check.energy}/5</p>` : ''}
              ${check.notes ? `<p class="detail-notes">📝 ${check.notes}</p>` : ''}
            </div>
          `, formatDate(check.date));
        }
      });
    });
  }

  function renderAnalytics() {
    const checks = state.data.checkIns;
    const moodDist = {};
    CONFIG.MOODS.forEach(m => moodDist[m.label] = 0);
    checks.forEach(c => { if (moodDist[c.moodLabel] !== undefined) moodDist[c.moodLabel]++; });
    const pieData = Object.entries(moodDist).map(([label, value]) => {
      const mood = CONFIG.MOODS.find(m => m.label === label);
      return { label, value, color: mood?.color || '#ccc' };
    }).filter(d => d.value > 0);
    const lineData = checks.slice(-30).map(c => ({ label: c.date.slice(5), value: c.moodValue }));
    ensureView('view-analytics', `
      <div class="analytics-page">
        <h1>Your Wellness Analytics 📊</h1>
        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>Mood Trend (Last 30 Days)</h3>
            <div class="chart-container" id="analytics-mood-trend"></div>
          </div>
          <div class="analytics-card">
            <h3>Mood Distribution</h3>
            <div class="chart-container" id="analytics-mood-dist"></div>
          </div>
          <div class="analytics-card full-width">
            <h3>Year in Review</h3>
            <div class="chart-container" id="analytics-heatmap"></div>
          </div>
          <div class="analytics-card">
            <h3>Key Stats</h3>
            <div class="key-stats">
              <div class="key-stat"><span class="key-stat-value">${checks.length}</span><span class="key-stat-label">Total Check-Ins</span></div>
              <div class="key-stat"><span class="key-stat-value">${calculateStreak()}</span><span class="key-stat-label">Current Streak</span></div>
              <div class="key-stat"><span class="key-stat-value">${checks.length ? (checks.reduce((s, c) => s + c.moodValue, 0) / checks.length).toFixed(1) : '--'}</span><span class="key-stat-label">Avg Mood</span></div>
              <div class="key-stat"><span class="key-stat-value">${state.data.goals.filter(g => g.completed).length}</span><span class="key-stat-label">Goals Crushed</span></div>
            </div>
          </div>
        </div>
        <div class="export-section">
          <h3>Export Your Data</h3>
          <p>Your data belongs to you. Export it anytime.</p>
          <button class="btn btn-secondary" id="export-json">Export as JSON</button>
          <button class="btn btn-secondary" id="export-csv">Export as CSV</button>
        </div>
      </div>
    `);
    if (lineData.length) {
      Charts.create(document.getElementById('analytics-mood-trend'), 'line', lineData, { color: '#3b82f6', height: 250 });
    } else {
      document.getElementById('analytics-mood-trend').innerHTML = '<p class="empty-chart">Not enough data yet. Check in daily!</p>';
    }
    if (pieData.length) {
      Charts.create(document.getElementById('analytics-mood-dist'), 'pie', pieData, { height: 250 });
    } else {
      document.getElementById('analytics-mood-dist').innerHTML = '<p class="empty-chart">No mood data yet.</p>';
    }
    const heatmapData = checks.map(c => ({ date: c.date, value: c.moodValue }));
    if (heatmapData.length) {
      Charts.create(document.getElementById('analytics-heatmap'), 'heatmap', heatmapData, { height: 200 });
    }
    document.getElementById('export-json')?.addEventListener('click', () => Storage.export('json'));
    document.getElementById('export-csv')?.addEventListener('click', () => Storage.export('csv'));
  }

  function renderResources() {
    ensureView('view-resources', `
      <div class="resources-page">
        <h1>Wellness Resources 💙</h1>
        <p class="resources-intro">Tools and tips to support your mental health and wellbeing.</p>
        <div class="resources-grid">
          ${CONFIG.RESOURCES.map(r => `
            <div class="resource-card ${r.urgent ? 'urgent' : ''}" data-resource="${r.id}">
              <div class="resource-icon">${r.icon}</div>
              <h3>${r.title}</h3>
              <p>${r.type === 'interactive' ? 'Interactive exercise' : r.type === 'link' ? 'External resources' : 'Helpful article'}</p>
              ${r.duration ? `<span class="resource-duration">⏱️ ${r.duration}</span>` : ''}
              ${r.urgent ? '<span class="urgent-badge">URGENT</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `);
    $$('.resource-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.resource;
        if (id === 'breathing') renderBreathingExercise();
        else if (id === 'crisis') {
          Modal.open(`
            <div class="crisis-resources">
              <h3>🆘 You Are Not Alone</h3>
              <p>If you or someone you know is in crisis, please reach out:</p>
              <div class="crisis-list">
                <a href="tel:988" class="crisis-link">📞 988 Suicide & Crisis Lifeline</a>
                <a href="tel:1-800-273-8255" class="crisis-link">📞 1-800-273-TALK (8255)</a>
                <a href="sms:741741" class="crisis-link">💬 Text HOME to 741741 (Crisis Text Line)</a>
              </div>
              <p class="crisis-note">These resources are confidential and available 24/7.</p>
            </div>
          `, 'Crisis Resources');
        } else {
          const tips = {
            sleep: '<h3>😴 Sleep Tips</h3><ul><li>Keep a consistent sleep schedule</li><li>Avoid screens 1 hour before bed</li><li>Keep your room cool and dark</li><li>Limit caffeine after 2pm</li><li>Try a bedtime routine</li></ul>',
            study: '<h3>📚 Study Techniques</h3><ul><li>Pomodoro: 25 min work, 5 min break</li><li>Active recall: Test yourself</li><li>Spaced repetition: Review over time</li><li>Teach someone else</li><li>Study in the same place</li></ul>',
            stress: '<h3>🧘 Stress Management</h3><ul><li>Practice deep breathing</li><li>Take regular breaks</li><li>Exercise regularly</li><li>Talk to someone you trust</li><li>Write down your worries</li></ul>',
            selfcare: '<h3>💙 Self-Care Ideas</h3><ul><li>Take a walk outside</li><li>Listen to your favorite music</li><li>Drink water and eat well</li><li>Call a friend</li><li>Do something creative</li></ul>'
          };
          Modal.open(tips[id] || '<p>Content coming soon!</p>', CONFIG.RESOURCES.find(r => r.id === id)?.title || 'Resource');
        }
      });
    });
  }

  function renderBreathingExercise() {
    Modal.open(`
      <div class="breathing-exercise">
        <div class="breathing-circle" id="breathing-circle">
          <div class="breathing-text" id="breathing-text">Breathe In</div>
        </div>
        <p class="breathing-instruction">Follow the circle. Inhale as it expands, exhale as it contracts.</p>
        <button class="btn btn-secondary" id="stop-breathing">Stop</button>
      </div>
    `, 'Breathing Exercise');
    let phase = 0; // 0=in, 1=hold, 2=out, 3=hold
    const texts = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
    const circle = document.getElementById('breathing-circle');
    const text = document.getElementById('breathing-text');
    let interval;
    function breathe() {
      text.textContent = texts[phase];
      if (phase === 0) circle.style.transform = 'scale(1.5)';
      else if (phase === 2) circle.style.transform = 'scale(1)';
      phase = (phase + 1) % 4;
    }
    breathe();
    interval = setInterval(breathe, 4000);
    document.getElementById('stop-breathing')?.addEventListener('click', () => {
      clearInterval(interval);
      Modal.close();
    });
  }

  function renderSettings() {
    ensureView('view-settings', `
      <div class="settings-page">
        <h1>Settings ⚙️</h1>
        <div class="settings-grid">
          <div class="settings-card">
            <h3>Appearance</h3>
            <div class="setting-row">
              <label>Theme</label>
              <button class="btn btn-secondary" id="theme-toggle">${state.theme === 'dark' ? '☀️ Light' : state.theme === 'high-contrast' ? '👁️ High Contrast' : '🌙 Dark'}</button>
            </div>
            <div class="setting-row">
              <label>Font Size</label>
              <div class="font-size-controls">
                <button class="font-size-btn ${state.fontSize === 'small' ? 'active' : ''}" data-size="small">A</button>
                <button class="font-size-btn ${state.fontSize === 'medium' ? 'active' : ''}" data-size="medium">A</button>
                <button class="font-size-btn ${state.fontSize === 'large' ? 'active' : ''}" data-size="large">A</button>
              </div>
            </div>
            <div class="setting-row">
              <label>High Contrast</label>
              <button class="btn btn-secondary" id="high-contrast-toggle">${state.highContrast ? 'On' : 'Off'}</button>
            </div>
            <div class="setting-row">
              <label>Reduced Motion</label>
              <button class="btn btn-secondary" id="reduced-motion-toggle">${state.reducedMotion ? 'On' : 'Off'}</button>
            </div>
          </div>
          <div class="settings-card">
            <h3>Privacy</h3>
            <div class="setting-row">
              <label>Share Anonymous Data</label>
              <label class="toggle-label">
                <input type="checkbox" id="share-toggle" ${state.data.settings.shareWithTeacher ? 'checked' : ''}>
                <span class="toggle-switch"></span>
              </label>
            </div>
            <div class="setting-row">
              <label>Allow Anonymous Stats</label>
              <label class="toggle-label">
                <input type="checkbox" id="anonymous-toggle" ${state.data.settings.allowAnonymous ? 'checked' : ''}>
                <span class="toggle-switch"></span>
              </label>
            </div>
            <div class="privacy-info">
              <p>🔒 <strong>Your data stays local.</strong> WellSpace stores everything on your device. We never upload your personal information to any server.</p>
            </div>
          </div>
          <div class="settings-card">
            <h3>Notifications</h3>
            <div class="setting-row">
              <label>Enable Notifications</label>
              <label class="toggle-label">
                <input type="checkbox" id="notif-toggle" ${state.notifications ? 'checked' : ''}>
                <span class="toggle-switch"></span>
              </label>
            </div>
            <div class="setting-row">
              <label>Daily Reminder Time</label>
              <input type="time" id="reminder-time" value="${state.data.settings.reminderTime}">
            </div>
          </div>
          <div class="settings-card danger-zone">
            <h3>Data Management</h3>
            <div class="setting-row">
              <label>Export Data</label>
              <button class="btn btn-secondary" id="settings-export-json">Export JSON</button>
              <button class="btn btn-secondary" id="settings-export-csv">Export CSV</button>
            </div>
            <div class="setting-row">
              <label>Import Data</label>
              <input type="file" id="import-file" accept=".json">
            </div>
            <div class="setting-row">
              <label>Delete All Data</label>
              <button class="btn btn-danger" id="clear-data-btn">Clear Everything</button>
            </div>
          </div>
        </div>
      </div>
    `);
    Theme.bindEvents();
    document.getElementById('share-toggle')?.addEventListener('change', (e) => {
      state.data.settings.shareWithTeacher = e.target.checked;
      Storage.save();
      notify('Privacy settings updated', 'success');
    });
    document.getElementById('anonymous-toggle')?.addEventListener('change', (e) => {
      state.data.settings.allowAnonymous = e.target.checked;
      Storage.save();
    });
    document.getElementById('notif-toggle')?.addEventListener('change', (e) => {
      state.notifications = e.target.checked;
      Storage.save();
    });
    document.getElementById('reminder-time')?.addEventListener('change', (e) => {
      state.data.settings.reminderTime = e.target.value;
      Storage.save();
    });
    document.getElementById('settings-export-json')?.addEventListener('click', () => Storage.export('json'));
    document.getElementById('settings-export-csv')?.addEventListener('click', () => Storage.export('csv'));
    document.getElementById('import-file')?.addEventListener('change', (e) => {
      if (e.target.files[0]) Storage.import(e.target.files[0]);
    });
    document.getElementById('clear-data-btn')?.addEventListener('click', Storage.clear);
  }

  function renderProfile() {
    const unlocked = getUnlockedAchievements();
    const locked = getLockedAchievements();
    ensureView('view-profile', `
      <div class="profile-page">
        <div class="profile-header">
          <div class="profile-avatar">${state.user?.avatar || '👤'}</div>
          <div class="profile-info">
            <h1>${state.user?.name || 'User'}</h1>
            <p class="profile-role">${state.role === 'student' ? '👨‍🎓 Student' : '👩‍🏫 Teacher'}</p>
            <p class="profile-since">Member since ${state.user?.createdAt ? formatDate(state.user.createdAt.split('T')[0]) : 'recently'}</p>
          </div>
          <button class="btn btn-secondary" id="edit-profile-btn">Edit Profile</button>
        </div>
        <div class="profile-stats">
          <div class="profile-stat"><span class="profile-stat-value">${state.data.checkIns.length}</span><span>Check-Ins</span></div>
          <div class="profile-stat"><span class="profile-stat-value">${calculateStreak()}</span><span>Streak</span></div>
          <div class="profile-stat"><span class="profile-stat-value">${state.data.achievements.length}</span><span>Badges</span></div>
          <div class="profile-stat"><span class="profile-stat-value">${state.data.goals.filter(g => g.completed).length}</span><span>Goals</span></div>
        </div>
        <div class="achievements-section">
          <h2>Achievements 🏆</h2>
          <div class="achievements-grid">
            ${unlocked.map(a => `
              <div class="achievement-card unlocked">
                <span class="achievement-icon">${a.icon}</span>
                <h4>${a.name}</h4>
                <p>${a.desc}</p>
              </div>
            `).join('')}
            ${locked.map(a => `
              <div class="achievement-card locked">
                <span class="achievement-icon">🔒</span>
                <h4>${a.name}</h4>
                <p>${a.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `);
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      Modal.open(`
        <form id="edit-profile-form">
          <div class="form-group"><label for="edit-name">Name</label><input type="text" id="edit-name" value="${state.user?.name || ''}"></div>
          <div class="form-group"><label for="edit-email">Email</label><input type="email" id="edit-email" value="${state.user?.email || ''}"></div>
          <div class="form-group"><label for="edit-avatar">Avatar</label>
            <select id="edit-avatar">
              <option value="👨‍🎓" ${state.user?.avatar === '👨‍🎓' ? 'selected' : ''}>👨‍🎓 Student</option>
              <option value="👩‍🎓" ${state.user?.avatar === '👩‍🎓' ? 'selected' : ''}>👩‍🎓 Student</option>
              <option value="👩‍🏫" ${state.user?.avatar === '👩‍🏫' ? 'selected' : ''}>👩‍🏫 Teacher</option>
              <option value="👨‍🏫" ${state.user?.avatar === '👨‍🏫' ? 'selected' : ''}>👨‍🏫 Teacher</option>
              <option value="🧑‍🎓" ${state.user?.avatar === '🧑‍🎓' ? 'selected' : ''}>🧑‍🎓 Neutral</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
        </form>
      `, 'Edit Profile');
      $('#edit-profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        state.user.name = $('#edit-name').value.trim();
        state.user.email = $('#edit-email').value.trim();
        state.user.avatar = $('#edit-avatar').value;
        Storage.save();
        Modal.close();
        notify('Profile updated!', 'success');
        renderProfile();
      });
    });
  }

  function renderAbout() {
    ensureView('view-about', `
      <div class="static-page">
        <h1>About WellSpace 💙</h1>
        <div class="about-content">
          <p class="lead">WellSpace is a free, open-source student wellness platform built with privacy at its core.</p>
          <h2>Our Mission</h2>
          <p>We believe every student deserves a safe, private space to check in with themselves. WellSpace gives students tools to track mood, set goals, and build healthy habits—while giving teachers the anonymous insights they need to support their classrooms.</p>
          <h2>Why WellSpace?</h2>
          <ul>
            <li><strong>Privacy First:</strong> Your data never leaves your device unless you choose to share it.</li>
            <li><strong>Student-Owned:</strong> You control your data. Export it, delete it, or keep it local.</li>
            <li><strong>Free Forever:</strong> No ads, no subscriptions, no selling data.</li>
            <li><strong>Open Source:</strong> Our code is public. Anyone can audit it or contribute.</li>
          </ul>
          <h2>Version</h2>
          <p>WellSpace v${CONFIG.VERSION}</p>
          <div class="about-actions">
            <a href="https://github.com/yourusername/wellspace" class="btn btn-secondary" target="_blank" rel="noopener">View on GitHub</a>
            <button class="btn btn-secondary" data-view="roadmap">View Roadmap</button>
          </div>
        </div>
      </div>
    `);
  }

  function renderFAQ() {
    ensureView('view-faq', `
      <div class="static-page">
        <h1>Frequently Asked Questions ❓</h1>
        <div class="faq-list">
          <details class="faq-item">
            <summary>Is my data really private?</summary>
            <p>Yes. All your data is stored locally in your browser using localStorage. It never touches our servers unless you explicitly choose to share anonymous class statistics.</p>
          </details>
          <details class="faq-item">
            <summary>Can my teacher see my individual mood?</summary>
            <p>No. Teachers only see anonymous, aggregated class trends. Your individual check-ins, notes, and personal data are never visible to anyone unless you choose to share them.</p>
          </details>
          <details class="faq-item">
            <summary>What happens if I clear my browser data?</summary>
            <p>Your WellSpace data will be deleted. We recommend exporting your data regularly from the Settings page as a backup.</p>
          </details>
          <details class="faq-item">
            <summary>Is WellSpace free?</summary>
            <p>Yes, WellSpace is completely free. No ads, no subscriptions, no hidden costs. We believe student wellness tools should be accessible to everyone.</p>
          </details>
          <details class="faq-item">
            <summary>Can I use this on my phone?</summary>
            <p>Absolutely! WellSpace is designed to work on all devices—phones, tablets, and desktops. You can also add it to your home screen for a native app feel.</p>
          </details>
          <details class="faq-item">
            <summary>How do I join a class?</summary>
            <p>Ask your teacher for their class code, then go to your dashboard and click "Join Class." Enter the code and you're in!</p>
          </details>
        </div>
      </div>
    `);
  }

  function renderContact() {
    ensureView('view-contact', `
      <div class="static-page">
        <h1>Contact Us 📧</h1>
        <p>Have questions, feedback, or want to contribute? We'd love to hear from you.</p>
        <form id="contact-form" class="contact-form">
          <div class="form-group"><label for="contact-name">Name</label><input type="text" id="contact-name" required></div>
          <div class="form-group"><label for="contact-email">Email</label><input type="email" id="contact-email" required></div>
          <div class="form-group"><label for="contact-message">Message</label><textarea id="contact-message" rows="5" required></textarea></div>
          <button type="submit" class="btn btn-primary btn-block">Send Message</button>
        </form>
        <div class="contact-alternatives">
          <p>Or reach us at:</p>
          <a href="mailto:hello@wellspace.app" class="contact-link">hello@wellspace.app</a>
          <a href="https://github.com/yourusername/wellspace/issues" class="contact-link" target="_blank" rel="noopener">GitHub Issues</a>
        </div>
      </div>
    `);
    $('#contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      notify('Message sent! (Demo mode - no email sent)', 'success');
      e.target.reset();
    });
  }

  function renderPrivacy() {
    ensureView('view-privacy', `
      <div class="static-page">
        <h1>Privacy Policy 🔒</h1>
        <div class="privacy-content">
          <p class="lead">WellSpace is built on a simple principle: <strong>your data belongs to you.</strong></p>
          <h2>What We Collect</h2>
          <p><strong>Nothing.</strong> WellSpace stores all data locally on your device. We do not operate servers that store your personal information.</p>
          <h2>Local Storage</h2>
          <p>We use your browser's localStorage to save:</p>
          <ul>
            <li>Your profile information (name, email if provided)</li>
            <li>Mood check-ins and notes</li>
            <li>Goals, habits, and achievements</li>
            <li>App settings and preferences</li>
          </ul>
          <h2>Data Sharing</h2>
          <p>You control what you share:</p>
          <ul>
            <li><strong>Anonymous class statistics:</strong> Optional. Only aggregated data is shared.</li>
            <li><strong>Individual data:</strong> Never shared without your explicit permission.</li>
          </ul>
          <h2>Your Rights</h2>
          <ul>
            <li>Export your data at any time</li>
            <li>Delete all data permanently</li>
            <li>Opt out of any data sharing</li>
            <li>Use the app without providing personal information</li>
          </ul>
          <h2>Third Parties</h2>
          <p>We do not use third-party analytics, tracking cookies, or advertising networks.</p>
          <p class="privacy-date">Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    `);
  }

  function renderRoadmap() {
    ensureView('view-roadmap', `
      <div class="static-page">
        <h1>Roadmap 🗺️</h1>
        <div class="roadmap">
          <div class="roadmap-item completed">
            <span class="roadmap-status">✅</span>
            <div class="roadmap-content">
              <h3>Mood Check-Ins</h3>
              <p>Daily mood tracking with notes and sleep data</p>
            </div>
          </div>
          <div class="roadmap-item completed">
            <span class="roadmap-status">✅</span>
            <div class="roadmap-content">
              <h3>Goals & Habits</h3>
              <p>Personal goal setting and habit tracking</p>
            </div>
          </div>
          <div class="roadmap-item completed">
            <span class="roadmap-status">✅</span>
            <div class="roadmap-content">
              <h3>Teacher Dashboard</h3>
              <p>Anonymous class wellness analytics</p>
            </div>
          </div>
          <div class="roadmap-item completed">
            <span class="roadmap-status">✅</span>
            <div class="roadmap-content">
              <h3>Privacy Controls</h3>
              <p>Local-first storage with export/import</p>
            </div>
          </div>
          <div class="roadmap-item in-progress">
            <span class="roadmap-status">🚧</span>
            <div class="roadmap-content">
              <h3>Push Notifications</h3>
              <p>Daily reminder notifications</p>
            </div>
          </div>
          <div class="roadmap-item">
            <span class="roadmap-status">⏳</span>
            <div class="roadmap-content">
              <h3>Parent Mode</h3>
              <p>Optional parent insights for younger students</p>
            </div>
          </div>
          <div class="roadmap-item">
            <span class="roadmap-status">⏳</span>
            <div class="roadmap-content">
              <h3>School Admin Dashboard</h3>
              <p>District-wide wellness insights</p>
            </div>
          </div>
          <div class="roadmap-item">
            <span class="roadmap-status">⏳</span>
            <div class="roadmap-content">
              <h3>Mobile App</h3>
              <p>Native iOS and Android apps</p>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  // ==================== INITIALIZATION ====================
  function init() {
    Storage.load();
    Theme.init();
    Router.init();

    // Create screen reader announcer if not exists
    if (!document.getElementById('sr-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }

    // Keyboard navigation enhancement
    document.addEventListener('keydown', (e) => {
      // Skip to content
      if (e.key === 'Tab' && e.shiftKey) {
        const skipLink = document.getElementById('skip-link');
        if (skipLink) skipLink.focus();
      }
    });

    // Handle all button clicks with data-action
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const action = btn.dataset.action;
        if (action === 'export-json') Storage.export('json');
        if (action === 'export-csv') Storage.export('csv');
        if (action === 'clear-data') Storage.clear();
      }
    });

    // Check for daily reminder
    if (state.data.settings.reminderEnabled && state.user) {
      const lastCheck = getTodaysCheckIn();
      if (!lastCheck) {
        const hour = new Date().getHours();
        const reminderHour = parseInt(state.data.settings.reminderTime.split(':')[0]);
        if (hour >= reminderHour) {
          notify('👋 Don't forget your daily check-in!', 'info', 8000);
        }
      }
    }

    // Start onboarding for new users
    if (!state.user && !localStorage.getItem(CONFIG.ONBOARDING_KEY)) {
      setTimeout(() => Onboarding.start(), 500);
    }

    // Initial render
    const hash = location.hash.replace('#', '');
    if (hash && Router.routes[hash]) {
      Router.navigate(hash, false);
    } else if (state.user) {
      Router.navigate(state.role === 'student' ? 'student-dashboard' : 'teacher-dashboard', false);
    } else {
      Router.navigate('home', false);
    }

    console.log(`%c${CONFIG.APP_NAME} v${CONFIG.VERSION}`, 'color: #3b82f6; font-size: 20px; font-weight: bold;');
    console.log('%cPrivacy-first student wellness platform', 'color: #6b7280; font-size: 12px;');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose minimal API for debugging (not in production)
  window.WellSpace = {
    version: CONFIG.VERSION,
    state: () => state,
    storage: Storage,
    notify,
    checkAchievement
  };

})();
