/**
 * Supabase Client — Creates a single instance of the Supabase client.
 *
 * Uses the NEXT_PUBLIC_ environment variables which are safe to expose
 * because Row Level Security (RLS) restricts all access to read-only.
 *
 * This client is used by both server components and client components.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
