let toastTimer;

function showToast(msg) {
    const t = document.getElementById('toast');
    if (t) {
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
    }
}

function goToDashboard() {
    // Get username from login or signup form
    let username = 'Jake';
    
    // Check if we're on login page
    const loginUsername = document.getElementById('login-username');
    if (loginUsername && loginUsername.value) {
        username = loginUsername.value;
    }
    
    // Check if we're on signup page
    const signupUsername = document.getElementById('signup-username');
    if (signupUsername && signupUsername.value) {
        username = signupUsername.value;
    }
    
    // Save username to localStorage
    localStorage.setItem('neurolearn_username', username);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

function showLogout() {
    // Clear stored username
    localStorage.removeItem('neurolearn_username');
    // Redirect to login page
    window.location.href = 'index.html';
    showToast('Logged out successfully 👋');
}

function selectRole(btn) {
    const buttons = document.querySelectorAll('.role-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Dashboard specific functions
function setNavTab(btn, subject) {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Sync subject tabs
    const subjectTabs = document.querySelectorAll('.subject-tab');
    subjectTabs.forEach(b => {
        const matches = b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${subject}'`);
        if (matches) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    filterLessons(subject, currentDifficulty);
}

function filterSubject(btn, subject) {
    const subjectTabs = document.querySelectorAll('.subject-tab');
    subjectTabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Sync nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(b => {
        const matches = b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${subject}'`);
        if (matches) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    filterLessons(subject, currentDifficulty);
}

let currentDifficulty = 'all';
let currentSubject = 'math';

function filterDifficulty(val) {
    currentDifficulty = val;
    filterLessons(currentSubject, val);
}

function filterLessons(subject, difficulty) {
    currentSubject = subject;
    const cards = document.querySelectorAll('.lesson-card');
    cards.forEach((card, i) => {
        const matchSubject = subject === 'all' || card.dataset.subject === subject;
        const matchDiff = difficulty === 'all' || card.dataset.difficulty === difficulty;
        const show = matchSubject && matchDiff;
        card.style.display = show ? 'flex' : 'none';
        if (show) {
            card.style.animationDelay = (i * 0.06) + 's';
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = '';
        }
    });
}

// Load username on dashboard
function loadUsername() {
    const username = localStorage.getItem('neurolearn_username');
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay && username) {
        usernameDisplay.textContent = username;
    }
}

// Animate progress bars on load (only for dashboard page)
if (document.getElementById('dashboard-screen')) {
    window.addEventListener('load', () => {
        loadUsername();
        // Show welcome toast
        const username = localStorage.getItem('neurolearn_username');
        if (username) {
            showToast(`Welcome back, ${username}! 🎉`);
        }
        
        setTimeout(() => {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const w = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = w;
                }, 100);
            });
        }, 600);
    });
}