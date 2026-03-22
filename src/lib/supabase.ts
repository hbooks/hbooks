import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

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
