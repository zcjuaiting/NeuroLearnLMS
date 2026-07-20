// supabase-config.js
const SUPABASE_URL = "https://dwgaqbqzedibulankjdn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z2FxYnF6ZWRpYnVsYW5ramRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjU2MjAsImV4cCI6MjA5NjUwMTYyMH0.eN7hRPKiHOoD5Sfl-0s8xtxy87QGjgO1sZSGoUalbU8";

// Wait for window.supabase to be available
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        // Initialize Supabase client
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase initialized:", typeof window.supabaseClient);
        console.log("✅ Supabase auth available:", typeof window.supabaseClient.auth);
    } else {
        console.warn("⚠️ window.supabase not available, retrying in 500ms...");
        setTimeout(initSupabase, 500);
    }
}

// Start initialization
initSupabase();

// Also try immediately (in case it's already loaded)
if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Export for other scripts to use
var supabase = window.supabaseClient;
