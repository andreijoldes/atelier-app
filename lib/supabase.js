// Configurare client Supabase
// Acest fișier exportă clientul Supabase pentru utilizare în toată aplicația

import { createClient } from '@supabase/supabase-js';

// Variabilele de mediu sunt definite în .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Creăm clientul Supabase (singleton)
// În build/prerender, variabilele pot lipsi — clientul va fi inactiv
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
