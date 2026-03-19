import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvfcmmjfyudgmjdzudkb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZmNtbWpmeXVkZ21qZHp1ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mzg2MzYsImV4cCI6MjA4OTUxNDYzNn0.VVK8WmcQAu9GCGnNYgwSJq8_gmkpIUOd2fi8lHICsBI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
