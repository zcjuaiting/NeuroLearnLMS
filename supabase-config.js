const SUPABASE_URL = "https://dwgaqbqzedibulankjdn.supabase.co"; 

const SUPABASE_ANON_KEY = "sb_publishable_99KUW9hXRlGzhk7WxuxRcw_b-9g8k2D"; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSupabaseConnection() {
    console.log("Attempting to reach your Supabase database...");
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error("CONNECTION FAILED! Detailed Error:", error.message);
        } else {
            console.log("CONNECTION SUCCESSFUL! Connected to: dwgaqbqzedibulankjdn");
            console.log("Test data sample retrieved:", data);
        }
    } catch (err) {
        console.error("System Error trying to connect:", err.message);
    }
}

checkSupabaseConnection();
