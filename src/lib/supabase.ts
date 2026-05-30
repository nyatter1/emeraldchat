import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://mypirvbflablxvhjuakx.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGlydmJmbGFibHh2aGp1YWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjk3OTMsImV4cCI6MjA5NTcwNTc5M30.INPfQ5D75vTEG5YLvB4WUjPphwoWzsPYrWXaI_wtBQo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
