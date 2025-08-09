const {createClient}  = require("@supabase/supabase-js")

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://yjijawbttohrgrmcjjpd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWphd2J0dG9ocmdybWNqanBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjE3ODMsImV4cCI6MjA3MDEzNzc4M30.RxpLgZqaEgGf_Ng7MhAUoxjfG1WmpPJ2CusGszz31T4"
);

module.exports = supabase