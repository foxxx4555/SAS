
import { supabase } from '../src/lib/supabase.js';

async function checkSchema() {
  const { data, error } = await supabase.from('messages').select('*').limit(1);
  if (error) {
    console.log('Messages table does not exist or error:', error.message);
  } else {
    console.log('Messages table exists. Columns:', Object.keys(data[0] || {}));
  }
}

checkSchema();
