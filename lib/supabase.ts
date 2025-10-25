import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
}

const globalForSupabase = globalThis as unknown as {
  supabaseClient?: SupabaseClient;
  supabaseAdminClient?: SupabaseClient;
};

export const getSupabaseClient = () => {
  if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }
  return globalForSupabase.supabaseClient;
};

export const getSupabaseAdmin = () => {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin can only be instantiated on the server");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  if (!globalForSupabase.supabaseAdminClient) {
    globalForSupabase.supabaseAdminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
        },
      }
    );
  }

  return globalForSupabase.supabaseAdminClient;
};
