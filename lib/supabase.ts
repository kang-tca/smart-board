/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
// They will be loaded from .env.local via Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
