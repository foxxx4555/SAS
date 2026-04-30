import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// تجاوز ميزة Web Locks المتسببة في الأخطاء مع البحث الديناميكي عن الدالة
const customDummyLock = async (...args) => {
  const acquire = args.find(arg => typeof arg === 'function');
  if (acquire) return await acquire(); 
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: customDummyLock
  }
});
