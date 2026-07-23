// ============================================================
// supabase-config.js - SINGLETON PATTERN
// ============================================================

const SUPABASE_URL = "https://dwgaqbqzedibulankjdn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z2FxYnF6ZWRpYnVsYW5ramRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjU2MjAsImV4cCI6MjA5NjUwMTYyMH0.eN7hRPKiHOoD5Sfl-0s8xtxy87QGjgO1sZSGoUalbU8";

// ============================================================
// ⭐ SINGLETON: Only create one Supabase client
// ============================================================
function initSupabase() {
    // Check if already initialized
    if (window.__supabaseClient) {
        console.log("✅ Supabase client already exists (singleton)");
        return window.__supabaseClient;
    }

    // Check if supabase is available globally
    if (typeof window.supabase !== 'undefined' && window.supabase) {
        window.__supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase client initialized (singleton)");
        return window.__supabaseClient;
    }

    console.warn("⚠️ window.supabase not available, will retry...");
    return null;
}

// Initialize immediately if available
const client = initSupabase();

// For backward compatibility
window.supabaseClient = window.__supabaseClient || client;

// Export for other scripts
var supabase = window.__supabaseClient || window.supabaseClient;

// ============================================================
// Function to get the singleton client (for pages that load late)
// ============================================================
function getSupabaseClient() {
    return new Promise((resolve) => {
        if (window.__supabaseClient && window.__supabaseClient.auth) {
            resolve(window.__supabaseClient);
            return;
        }
        
        let retries = 0;
        const maxRetries = 10;
        const interval = setInterval(() => {
            retries++;
            
            if (window.__supabaseClient && window.__supabaseClient.auth) {
                clearInterval(interval);
                resolve(window.__supabaseClient);
                return;
            }
            
            if (typeof window.supabase !== 'undefined' && window.supabase) {
                window.__supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                clearInterval(interval);
                resolve(window.__supabaseClient);
                return;
            }
            
            if (retries >= maxRetries) {
                clearInterval(interval);
                resolve(null);
            }
        }, 500);
    });
}

console.log("🔵 supabase-config.js loaded");
