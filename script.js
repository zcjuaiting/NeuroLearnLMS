/* ============================================================
   NeuroLearn – Complete Shared JavaScript
   ============================================================ */

// ---- CHECK IF SUPABASE IS LOADED ----
console.log("🔵 script.js loaded");

// Wait for supabase to be available
function waitForSupabase() {
    return new Promise((resolve) => {
        if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
            resolve(supabase);
            return;
        }
        if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient && window.supabaseClient.auth) {
            // Use the client from window
            var supabase = window.supabaseClient;
            resolve(supabase);
            return;
        }
        // Check again in 500ms
        setTimeout(() => waitForSupabase().then(resolve), 500);
    });
}

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

// ============================================
// SUPABASE AUTHENTICATION FUNCTIONS
// ============================================

// ---- LOGIN WITH SUPABASE ----
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
   
   const captcha = grecaptcha.getResponse();
   
   if (!captcha) {
    showToast("Please complete the CAPTCHA.", "#FF6B6B");
    return;
   }
    
    if (!email) {
        showToast('Please enter your email address!', '#FF6B6B');
        document.getElementById('login-email').focus();
        return;
    }
    
    if (!password) {
        showToast('Please enter your password!', '#FF6B6B');
        document.getElementById('login-password').focus();
        return;
    }
    
    btn.textContent = 'Logging in...';
    btn.disabled = true;
    
    try {
        // Wait for supabase to be available
        const supabaseClient = await waitForSupabase();
        
        if (!supabaseClient || !supabaseClient.auth) {
            showToast('Supabase not ready. Please refresh.', '#FF6B6B');
            btn.textContent = 'Login';
            btn.disabled = false;
            return;
        }
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                showToast('Invalid email or password. Please try again.', '#FF6B6B');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('Please verify your email before logging in. 📧', '#FF8C42');
            } else {
                showToast(error.message, '#FF6B6B');
            }
            btn.textContent = 'Login';
            btn.disabled = false;
            return;
        }
        
        if (data.user) {
            console.log('✅ User logged in:', data.user.id);
            
            // Get user data from users table
            const { data: userData, error: userError } = await supabaseClient
                .from('users')
                .select('display_name, level, xp')
                .eq('id', data.user.id)
                .single();
            
            if (userError) {
                console.warn('⚠️ User not found in users table, creating record...');
                
                const displayName = email.split('@')[0];
                const { error: insertError } = await supabaseClient
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: email,
                        display_name: displayName,
                        role: 'student',
                        level: 1,
                        xp: 0,
                        streak_days: 0
                    });
                
                if (insertError) {
                    console.error('Error inserting user:', insertError);
                } else {
                    console.log('✅ User inserted into users table');
                }
                
                localStorage.setItem('neurolearn_display_name', displayName);
                localStorage.setItem('neurolearn_level', '1');
                localStorage.setItem('neurolearn_xp', '0');
            } else {
                const displayName = userData.display_name || email.split('@')[0];
                localStorage.setItem('neurolearn_display_name', displayName);
                localStorage.setItem('neurolearn_level', userData.level || 1);
                localStorage.setItem('neurolearn_xp', userData.xp || 0);
            }
            
            localStorage.setItem('neurolearn_user_email', email);
            localStorage.setItem('neurolearn_user_id', data.user.id);
            
            const displayName = localStorage.getItem('neurolearn_display_name');
            showToast(`Welcome back, ${displayName}! 🎉`, '#4CAF7D');
       
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        }
    } catch (error) {
        console.error('💥 Login error:', error);
        showToast('An error occurred. Please try again.', '#FF6B6B');
    } finally {
        btn.textContent = 'Login';
        btn.disabled = false;
    }
}

// ---- SIGNUP WITH SUPABASE ----
async function handleSignup() {
    const displayName = document.getElementById('signup-displayname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const btn = document.getElementById('signup-btn');

    const activeRoleBtn = document.querySelector('.role-btn.active');
    const role = activeRoleBtn ? activeRoleBtn.dataset.role : 'student';

   const captcha = grecaptcha.getResponse();
   if (!captcha) {
        showToast("Please complete the CAPTCHA.", "#FF6B6B");
        return;
    }

    // ----- VALIDATION -----
    if (!displayName) {
        showToast('Please enter your display name!', '#FF6B6B');
        document.getElementById('signup-displayname').focus();
        return;
    }

    if (!email) {
        showToast('Please enter your email address!', '#FF6B6B');
        document.getElementById('signup-email').focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address!', '#FF6B6B');
        document.getElementById('signup-email').focus();
        return;
    }

    if (!password) {
        showToast('Please create a password!', '#FF6B6B');
        document.getElementById('signup-password').focus();
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters!', '#FF6B6B');
        document.getElementById('signup-password').focus();
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match!', '#FF6B6B');
        document.getElementById('signup-confirm-password').focus();
        return;
    }

    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
        // Wait for supabase to be available
        const supabaseClient = await waitForSupabase();
        
        if (!supabaseClient || !supabaseClient.auth) {
            showToast('Supabase not ready. Please refresh.', '#FF6B6B');
            btn.textContent = 'Create Account';
            btn.disabled = false;
            return;
        }
        
        console.log('🔵 Attempting Supabase auth signup...');
        
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_name: displayName,
                    role: role
                }
            }
        });

        if (error) {
            console.error('🔴 Supabase auth error:', error);
            if (error.message.includes('User already registered')) {
                showToast('This email is already registered. Please login instead.', '#FF8C42');
            } else {
                showToast(error.message, '#FF6B6B');
            }
            btn.textContent = 'Create Account';
            btn.disabled = false;
            return;
        }

        if (data && data.user) {
            console.log('✅ Supabase user created:', data.user.id);
            
            try {
                // Check if user already exists in users table
                const { data: existingUser } = await supabaseClient
                    .from('users')
                    .select('id')
                    .eq('id', data.user.id)
                    .single();

                if (!existingUser) {
                    const { error: insertError } = await supabaseClient
                        .from('users')
                        .insert({
                            id: data.user.id,
                            email: email,
                            display_name: displayName,
                            role: role,
                            level: 1,
                            xp: 0,
                            streak_days: 0
                        });

                    if (insertError) {
                        console.warn('⚠️ Could not insert into users table:', insertError.message);
                    } else {
                        console.log('✅ User inserted into users table');
                    }
                }
            } catch (err) {
                console.warn('⚠️ User insertion check failed:', err.message);
            }

            localStorage.setItem('neurolearn_display_name', displayName);
            localStorage.setItem('neurolearn_user_email', email);
            localStorage.setItem('neurolearn_user_id', data.user.id);
            localStorage.setItem('neurolearn_level', '1');
            localStorage.setItem('neurolearn_xp', '0');

            if (data.session) {
                showToast(`Account created successfully, ${displayName}! 🎉`, '#4CAF7D');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                showToast('Account created! Please check your email to confirm your account. 📧', '#4CAF7D');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            }
        } else {
            showToast('Something went wrong. Please try again.', '#FF6B6B');
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }
    } catch (error) {
        console.error('💥 Signup error:', error);
        showToast('An error occurred. Please try again.', '#FF6B6B');
        btn.textContent = 'Create Account';
        btn.disabled = false;
    } finally {
        btn.textContent = 'Create Account';
        btn.disabled = false;
    }
}

// ---- AUTO-LOGIN CHECK ----
async function checkAuthAndRedirect() {
    try {
        // Wait for supabase to be available
        const supabaseClient = await waitForSupabase();
        
        if (!supabaseClient || !supabaseClient.auth) {
            console.warn('⚠️ supabase not available for auth check');
            return;
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            const displayName = localStorage.getItem('neurolearn_display_name') || 
                               session.user.email.split('@')[0];
            localStorage.setItem('neurolearn_display_name', displayName);
            localStorage.setItem('neurolearn_user_email', session.user.email);
            localStorage.setItem('neurolearn_user_id', session.user.id);
            
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage === 'index.html' || currentPage === 'signup.html' || currentPage === '') {
                window.location.href = 'dashboard.html';
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// ---- CHECK IF USER IS LOGGED IN ----
async function checkAuth() {
    try {
        const supabaseClient = await waitForSupabase();
        if (!supabaseClient || !supabaseClient.auth) {
            return false;
        }
        const { data: { session } } = await supabaseClient.auth.getSession();
        return !!session;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
}

// ---- LOGOUT ----
async function showLogout() {
    try {
        const supabaseClient = await waitForSupabase();
        if (supabaseClient && supabaseClient.auth) {
            const { error } = await supabaseClient.auth.signOut();
            if (error) console.error('Logout error:', error);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('neurolearn_display_name');
    localStorage.removeItem('neurolearn_user_email');
    localStorage.removeItem('neurolearn_user_id');
    localStorage.removeItem('neurolearn_level');
    localStorage.removeItem('neurolearn_xp');
    window.location.href = 'index.html';
    showToast('Logged out successfully 👋');
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function goToDashboard() {
    checkAuth().then(isLoggedIn => {
        if (isLoggedIn) {
            window.location.href = 'dashboard.html';
        } else {
            showToast('Please login first!', '#FF6B6B');
            window.location.href = 'index.html';
        }
    });
}

function selectRole(btn) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ============================================
// LOAD USER INFO (FIXED - No "J. Johnson")
// ============================================

function loadUserInfo() {
    const displayName = localStorage.getItem('neurolearn_display_name') || 'Student';
    console.log('🔵 loadUserInfo() - Display name:', displayName);
    
    const elements = ['welcome-username', 'nav-username', 'profile-username', 'lesson-username', 'report-name'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = displayName;
    });
    
    const studentName = document.getElementById('student-name');
    if (studentName) {
        studentName.textContent = displayName;
    }
    const infoName = document.getElementById('info-name');
    if (infoName) {
        infoName.textContent = displayName;
    }
}

// ============================================
// DASHBOARD FILTER FUNCTIONS
// ============================================

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

// ============================================
// LESSON FUNCTIONS
// ============================================

function startLesson(lessonType) {
    localStorage.setItem('currentLesson', lessonType);
    window.location.href = 'lesson.html';
}

function loadLessonProgress() {
    const lessons = [
        { id: 'addition', progressEl: 'addition-progress', barEl: 'addition-bar', btnEl: 'addition-btn' },
        { id: 'subtraction', progressEl: 'subtraction-progress', barEl: 'subtraction-bar', btnEl: 'subtraction-btn' },
        { id: 'plant', progressEl: 'plant-progress', barEl: 'plant-bar', btnEl: 'plant-btn' },
        { id: 'reading', progressEl: 'reading-progress', barEl: 'reading-bar', btnEl: 'reading-btn' },
        { id: 'ancient', progressEl: 'ancient-progress', barEl: 'ancient-bar', btnEl: 'ancient-btn' }
    ];

    lessons.forEach(lesson => {
        let pct = parseInt(localStorage.getItem(`progress_${lesson.id}_pct`)) || 0;
        if (pct > 100) pct = 100;

        const savedProgress = localStorage.getItem(`progress_${lesson.id}`);
        let completed = false;
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                completed = progress.completed || false;
            } catch(e) {}
        }

        const progressEl = document.getElementById(lesson.progressEl);
        const barEl = document.getElementById(lesson.barEl);
        if (progressEl) progressEl.textContent = pct + '%';
        if (barEl) barEl.style.width = pct + '%';

        const btn = document.getElementById(lesson.btnEl);
        if (btn) {
            if (pct === 0) {
                btn.textContent = '▷ Start';
                btn.className = 'btn-action start';
                btn.onclick = function() { startLesson(lesson.id); };
            } else if (pct < 100) {
                btn.textContent = '▶ Continue';
                btn.className = 'btn-action continue';
                btn.onclick = function() { startLesson(lesson.id); };
            } else if (pct === 100) {
                btn.textContent = '↺ Retake';
                btn.className = 'btn-action review';
                btn.onclick = function() {
                    if (confirm(`Are you sure you want to retake the ${lesson.id.charAt(0).toUpperCase() + lesson.id.slice(1)} lesson? This will reset your progress.`)) {
                        localStorage.removeItem(`progress_${lesson.id}`);
                        localStorage.removeItem(`progress_${lesson.id}_pct`);
                        loadLessonProgress();
                        showToast('Progress reset! You can retake the lesson now.', '#FF8C42');
                    }
                };
            }
        }
    });
}

// ============================================
// ANIMATION FUNCTIONS
// ============================================

function animateProgressBars() {
    document.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
        const target = bar.dataset.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = target; }, 100);
    });
    document.querySelectorAll('.progress-fill:not([data-width])').forEach(bar => {
        const w = bar.style.width;
        if (w && w !== '0%') {
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = w; }, 100);
        }
    });
}

// ============================================
// PREFERENCE FUNCTIONS
// ============================================

function applyFontSize(val) {
    const map = { Small: '14px', Medium: '16px', Large: '18px' };
    document.documentElement.style.fontSize = map[val] || '16px';
    showToast(`Font size changed to ${val}`);
}

// ============================================
// NAVIGATION LINK ACTIVE STATE
// ============================================

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

// ============================================
// PAGE INITIALIZATION
// ============================================

// ---- Login Page ----
if (document.getElementById('login-screen')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthAndRedirect();
    });
}

// ---- Signup Page ----
if (document.getElementById('signup-screen')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthAndRedirect();
    });
}

// ---- Dashboard Page ----
if (document.getElementById('dashboard-screen')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUserInfo();
        loadLessonProgress();
        animateProgressBars();
        const displayName = localStorage.getItem('neurolearn_display_name');
        if (displayName) {
            showToast(`Welcome back, ${displayName}! 🎉`);
        }
    });
}

// ---- Profile Page ----
if (document.querySelector('.profile-tabs')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUserInfo();
        animateProgressBars();
    });
}

// ---- Report Page ----
if (document.getElementById('bar-chart')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUserInfo();
        animateProgressBars();
    });
}

// ---- Lesson Page ----
if (document.getElementById('q-list')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUserInfo();
    });
}

// ---- General DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    animateProgressBars();
});
