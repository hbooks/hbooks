import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwomtgvefbshvzgddnig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3b210Z3ZlZmJzaHZ6Z2RkbmlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzY0OTEsImV4cCI6MjA4NzY1MjQ5MX0.0NidxXSgT7entHMHt-ot1i5EQOXiJWK3aJnW3NRtCV0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get a signed URL for a private bucket file (valid for 1 hour)
 * @param filePath - The path of the file in the 'covers' bucket
 * @returns A temporary signed URL or empty string on failure
 */
export const getSignedUrl = async (filePath: string): Promise<string> => {
  if (!filePath) return '';
  try {
    const { data } = await supabase.storage
      .from('covers')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    return data?.signedUrl || '';
  } catch (err) {
    console.error('Failed to get signed URL:', err);
    return '';
  }
};
