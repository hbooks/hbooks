import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Custom fetch to add cache‑busting parameter for books and upcoming_books GET requests
const customFetch: typeof fetch = (url, options) => {
  const newUrl = new URL(url.toString());
  // Only add for GET requests to the tables that need fresh data
  if ((!options || options.method === 'GET' || options.method === undefined) &&
      (newUrl.pathname.includes('/rest/v1/books') || newUrl.pathname.includes('/rest/v1/upcoming_books'))) {
    newUrl.searchParams.set('_', Date.now().toString());
  }
  // Proceed with the original fetch, passing the modified URL and same options
  return fetch(newUrl.toString(), options);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  fetch: customFetch,
});

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
