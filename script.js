// ---- Toast Notification ----
let _toastTimer;

function showToast(msg, color) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    if (color) t.style.background = color;
    else t.style.background = '';
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ---- Navigation Functions ----
function goToDashboard() {
    let username = 'Jake';
    const loginUsername = document.getElementById('login-username');
    if (loginUsername && loginUsername.value) {
        username = loginUsername.value;
    }
    const signupUsername = document.getElementById('signup-username');
    if (signupUsername && signupUsername.value) {
        username = signupUsername.value;
    }
    localStorage.setItem('neurolearn_username', username);
    window.location.href = 'dashboard.html';
}

function showLogout() {
    localStorage.removeItem('neurolearn_username');
    window.location.href = 'index.html';
    showToast('Logged out successfully 👋');
}

function selectRole(btn) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ---- Load Username on Pages ----
function loadUsername() {
    const username = localStorage.getItem('neurolearn_username');
    if (username) {
        const elements = ['welcome-username', 'nav-username', 'profile-username', 'lesson-username', 'report-name'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = username;
        });
        const studentName = document.getElementById('student-name');
        if (studentName && username) {
            studentName.textContent = username + ' J. Johnson';
        }
        const infoName = document.getElementById('info-name');
        if (infoName && username) {
            infoName.textContent = username + ' J. Johnson';
        }
    }
}

// ---- Dashboard Filter Functions ----
let currentDifficulty = 'all';
let currentSubject = 'math';

function filterSubject(btn, subject) {
    document.querySelectorAll('.subject-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterLessons(subject, currentDifficulty);
}

function filterDifficulty(val) {
    currentDifficulty = val;
    filterLessons(currentSubject, val);
}

function filterLessons(subject, difficulty) {
    currentSubject = subject;
    const cards = document.querySelectorAll('.lesson-card');
    cards.forEach(card => {
        const cardSubject = card.dataset.subject;
        const cardDifficulty = card.dataset.difficulty;
        const matchSubject = subject === 'all' || cardSubject === subject;
        const matchDiff = difficulty === 'all' || cardDifficulty === difficulty;
        card.style.display = matchSubject && matchDiff ? 'flex' : 'none';
    });
}

// ---- Animate Progress Bars ----
function animateProgressBars() {
    document.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
        const target = bar.dataset.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = target;
        }, 100);
    });
    document.querySelectorAll('.progress-fill:not([data-width])').forEach(bar => {
        const w = bar.style.width;
        if (w && w !== '0%') {
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = w;
            }, 100);
        }
    });
}

// ---- Font Size Preference ----
function applyFontSize(val) {
    const map = { Small: '14px', Medium: '16px', Large: '18px' };
    document.documentElement.style.fontSize = map[val] || '16px';
    showToast(`Font size changed to ${val}`);
}

// ---- Set Active Navigation Link ----
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && href === currentPage) {
            tab.classList.add('active');
        } else if (currentPage === '' || currentPage === 'index.html') {
            if (tab.getAttribute('href') === 'dashboard.html') {
                tab.classList.add('active');
            }
        }
    });
}

// ---- Dashboard Specific Initialization ----
if (document.getElementById('dashboard-screen')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUsername();
        animateProgressBars();
        const username = localStorage.getItem('neurolearn_username');
        if (username) {
            showToast(`Welcome back, ${username}! 🎉`);
        }
    });
}

// ---- Profile Page Initialization ----
if (document.querySelector('.profile-tabs')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUsername();
        animateProgressBars();
    });
}

// ---- Report Page Initialization ----
if (document.getElementById('bar-chart')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUsername();
        animateProgressBars();
    });
}

// ---- Lesson Page Initialization ----
if (document.getElementById('q-list')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUsername();
    });
}

// ---- General DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    animateProgressBars();
});
