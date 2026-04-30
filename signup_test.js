import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pzhztpehytrsxwwqoquu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aHp0cGVoeXRyc3h3d3FvcXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NzQ5NzcsImV4cCI6MjA4NjI1MDk3N30.cjC32Jz4-Bfcj03R7ozmAOAcSlWL6kiCgmdYRSaqnZQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'rightwater156@gmail.com',
    password: 'admin123',
    options: {
        data: {
            display_name: 'Admin'
        }
    }
  });
  
  if (error) {
      console.error("Signup error:", error);
  } else {
      console.log("Signup success:", data);
  }
}

main();
