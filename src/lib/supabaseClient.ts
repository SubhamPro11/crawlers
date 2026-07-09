import { createClient } from "@supabase/supabase-js";

// Placeholders are required during build-time static generation on CI servers (like Vercel)
// when environment variables are not injected into the build container.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key-string";

if (supabaseUrl.includes("placeholder-project-url") || supabaseAnonKey === "placeholder-anon-key-string") {
  console.error("🚨 [Supabase Connection Warning]: Environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured! Falls back to placeholder values which will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
