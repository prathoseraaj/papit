import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string | undefined = process.env.supabase_url;
const supabaseAnonKey: string | undefined = process.env.supabase_anon_key;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
