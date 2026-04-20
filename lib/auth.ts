import { supabase } from "./supabaseClient";

/**
 * SAFE AUTH GETTER (single source of truth)
 */
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
};