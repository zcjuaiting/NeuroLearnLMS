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
        // Check again in 500ms (max 10 retries)
        let retries = 0;
        const maxRetries = 10;
        const interval = setInterval(() => {
            retries++;
            if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
                clearInterval(interval);
                resolve(supabase);
                return;
            }
            if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient && window.supabaseClient.auth) {
                clearInterval(interval);
                resolve(window.supabaseClient);
                return;
            }
            if (retries >= maxRetries) {
                clearInterval(interval);
                resolve(null);
            }
        }, 500);
    });
}

// ---- Toast Notification ----
let _toastTimer;

function showToast(msg, color) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = color || '#2E8C8C';
    t.style.color = '#FFFFFF';
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================
// SUPABASE AUTHENTICATION FUNCTIONS
// ============================================

// ---- LOGIN WITH SUPABASE ----
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    
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
                .select('display_name, role, level, xp, full_name, birthday, grade, child_code, parent_id')
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
                localStorage.setItem('neurolearn_user_role', 'student');
                localStorage.setItem('neurolearn_level', '1');
                localStorage.setItem('neurolearn_xp', '0');
            } else {
                const displayName = userData.display_name || email.split('@')[0];
                localStorage.setItem('neurolearn_display_name', displayName);
                localStorage.setItem('neurolearn_user_role', userData.role || 'student');
                localStorage.setItem('neurolearn_level', userData.level || 1);
                localStorage.setItem('neurolearn_xp', userData.xp || 0);
                
                // Store profile data for student profile page
                if (userData.full_name) localStorage.setItem('neurolearn_full_name', userData.full_name);
                if (userData.birthday) localStorage.setItem('neurolearn_birthday', userData.birthday);
                if (userData.grade) localStorage.setItem('neurolearn_grade', userData.grade);
                if (userData.child_code) localStorage.setItem('neurolearn_child_code', userData.child_code);
                
                // Check if user is a parent with linked children
                if (userData.role === 'parent') {
                    const { data: children } = await supabaseClient
                        .from('users')
                        .select('id, full_name, display_name')
                        .eq('parent_id', data.user.id);
                    
                    if (children && children.length > 0) {
                        localStorage.setItem('neurolearn_linked_child_id', children[0].id);
                        localStorage.setItem('neurolearn_linked_child_name', children[0].full_name || children[0].display_name || 'Child');
                    }
                }
            }
            
            localStorage.setItem('neurolearn_user_email', email);
            localStorage.setItem('neurolearn_user_id', data.user.id);
            
            const displayName = localStorage.getItem('neurolearn_display_name');
            const role = localStorage.getItem('neurolearn_user_role');
            
            showToast(`Welcome back, ${displayName}! 🎉`, '#4CAF7D');
            
            // ============================================
            // ⭐ ROLE-BASED REDIRECT ON LOGIN ⭐
            // ============================================
            setTimeout(() => {
                if (role === 'student') {
                    window.location.href = 'dashboard.html';
                } else if (role === 'parent') {
                    window.location.href = 'parent-dashboard.html';
                } else if (role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
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

// ---- SIGNUP WITH SUPABASE (ROLE-BASED REDIRECT) ----
async function handleSignup() {
    const displayName = document.getElementById('signup-displayname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const btn = document.getElementById('signup-btn');

    const activeRoleBtn = document.querySelector('.role-btn.active');
    const role = activeRoleBtn ? activeRoleBtn.dataset.role : 'student';

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
        const supabaseClient = await waitForSupabase();
        
        if (!supabaseClient || !supabaseClient.auth) {
            showToast('Supabase not ready. Please refresh.', '#FF6B6B');
            btn.textContent = 'Create Account';
            btn.disabled = false;
            return;
        }
        
        console.log('🔵 Attempting Supabase auth signup...');
        console.log('🎭 Selected role:', role);
        
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
            localStorage.setItem('neurolearn_user_role', role);
            localStorage.setItem('neurolearn_level', '1');
            localStorage.setItem('neurolearn_xp', '0');

            // ============================================
            // ⭐ ROLE-BASED REDIRECT ON SIGNUP ⭐
            // ============================================
            let redirectUrl = 'dashboard.html';
            
            if (role === 'student') {
                redirectUrl = 'student-setup.html';
            } else if (role === 'parent') {
                redirectUrl = 'parent-onboarding.html';
            } else if (role === 'admin') {
                redirectUrl = 'admin-dashboard.html';
            }

            console.log('🔄 Redirecting to:', redirectUrl);

            if (data.session) {
                showToast(`Account created successfully, ${displayName}! 🎉`, '#4CAF7D');
                setTimeout(() => {
                    window.location.href = redirectUrl;
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
        const supabaseClient = await waitForSupabase();
        
        if (!supabaseClient || !supabaseClient.auth) {
            console.warn('⚠️ supabase not available for auth check');
            return;
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            const displayName = localStorage.getItem('neurolearn_display_name') || 
                               session.user.email.split('@')[0];
            const role = localStorage.getItem('neurolearn_user_role') || 'student';
            
            localStorage.setItem('neurolearn_display_name', displayName);
            localStorage.setItem('neurolearn_user_email', session.user.email);
            localStorage.setItem('neurolearn_user_id', session.user.id);
            localStorage.setItem('neurolearn_user_role', role);
            
            const currentPage = window.location.pathname.split('/').pop();
            
            if (currentPage === 'index.html' || currentPage === 'signup.html' || currentPage === '') {
                console.log('🔄 Auto-redirecting based on role:', role);
                
                if (role === 'student') {
                    window.location.href = 'dashboard.html';
                } else if (role === 'parent') {
                    window.location.href = 'parent-dashboard.html';
                } else if (role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
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
    localStorage.removeItem('neurolearn_user_role');
    localStorage.removeItem('neurolearn_level');
    localStorage.removeItem('neurolearn_xp');
    localStorage.removeItem('neurolearn_full_name');
    localStorage.removeItem('neurolearn_birthday');
    localStorage.removeItem('neurolearn_grade');
    localStorage.removeItem('neurolearn_child_code');
    localStorage.removeItem('neurolearn_linked_child_id');
    localStorage.removeItem('neurolearn_linked_child_name');
    window.location.href = 'index.html';
    showToast('Logged out successfully 👋', '#FF8C42');
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function goToDashboard() {
    checkAuth().then(isLoggedIn => {
        if (isLoggedIn) {
            const role = localStorage.getItem('neurolearn_user_role') || 'student';
            if (role === 'student') {
                window.location.href = 'dashboard.html';
            } else if (role === 'parent') {
                window.location.href = 'parent-dashboard.html';
            } else if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
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
// LOAD USER INFO
// ============================================

function loadUserInfo() {
    const displayName = localStorage.getItem('neurolearn_display_name') || 'Student';
    console.log('🔵 loadUserInfo() - Display name:', displayName);
    
    const elements = ['welcome-username', 'nav-username', 'profile-username', 'lesson-username', 'report-name', 'parent-name'];
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
    const parentName = document.getElementById('parent-full-name');
    if (parentName) {
        parentName.textContent = displayName;
    }
}

// ============================================
// DASHBOARD FILTER FUNCTIONS
// ============================================

let currentDifficulty = 'all';
let currentSubject = 'all';

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
    showToast(`Font size changed to ${val}`, '#4CAF7D');
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
            showToast(`Welcome back, ${displayName}! 🎉`, '#4CAF7D');
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

// ---- Student Setup Page ----
if (document.querySelector('.setup-container')) {
    window.addEventListener('DOMContentLoaded', () => {
        const displayName = localStorage.getItem('neurolearn_display_name') || 'Student';
        const fullNameInput = document.getElementById('full-name');
        if (fullNameInput && displayName) {
            fullNameInput.value = displayName;
        }
    });
}

// ---- Parent Dashboard Page ----
if (document.querySelector('.report-layout')) {
    window.addEventListener('DOMContentLoaded', () => {
        loadUserInfo();
        // Check if child is linked
        const childName = localStorage.getItem('neurolearn_linked_child_name');
        if (childName) {
            const childInfo = document.querySelector('.rh-info p');
            if (childInfo) {
                childInfo.textContent = `Linked to ${childName}`;
            }
        }
    });
}

// ---- General DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    animateProgressBars();
});
