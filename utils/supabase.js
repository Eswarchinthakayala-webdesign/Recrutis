// utils/supabase.js
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default async function supabaseClient(accessToken) {
  // if accessToken is missing or invalid, fallback to anon key
  const isValidJwt = accessToken && accessToken.split(".").length === 3;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: isValidJwt
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {},
  });

  return supabase;
}
