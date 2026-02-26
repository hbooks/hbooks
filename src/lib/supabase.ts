import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwomtgvefbshvzgddnig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3b210Z3ZlZmJzaHZ6Z2RkbmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzY0OTEsImV4cCI6MjA4NzY1MjQ5MX0.0NidxXSgT7entHMHt-ot1i5EQOXiJWK3aJnW3NRtCV0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
