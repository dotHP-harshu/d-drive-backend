const {createClient}  = require("@supabase/supabase-js")
require("dotenv").config();

const url = process.env.SUPABASE_URL;

const key = process.env.SUPABASE_KEY;

// Create a single supabase client for interacting with your database
const supabase = createClient(url, key);

module.exports = supabase