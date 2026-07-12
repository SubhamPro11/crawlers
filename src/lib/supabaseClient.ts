import { createClient } from "@supabase/supabase-js";

// Placeholders are required during build-time static generation on CI servers (like Vercel)
// when environment variables are not injected into the build container.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key-string";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
