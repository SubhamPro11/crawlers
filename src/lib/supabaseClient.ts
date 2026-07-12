import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Placeholders are required during build-time static generation on CI servers (like Vercel)
// when environment variables are not injected into the build container.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key-string";

let supabaseInstance: SupabaseClient | null = null;

interface MockQueryBuilder {
  select: () => MockQueryBuilder;
  order: () => Promise<{ data: never[]; error: null }>;
  eq: () => MockQueryBuilder;
  single: () => Promise<{ data: null; error: null }>;
  contains: () => MockQueryBuilder;
  or: () => Promise<{ data: never[]; error: null }>;
  update: () => MockQueryBuilder;
  insert: () => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  then: (onfulfilled: (res: { data: never[]; error: null }) => void) => void;
}

const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  // Basic JWT check (3 sections split by dot) to determine if it is a valid token format
  const isPlaceholder = supabaseUrl.includes("placeholder-project-url") ||
                        supabaseAnonKey === "placeholder-anon-key-string" ||
                        !supabaseAnonKey ||
                        supabaseAnonKey.split(".").length !== 3;

  if (isPlaceholder) {
    console.warn("⚠️ [Supabase Connection Warning]: Initializing with mock client fallback due to placeholder or missing environment variables.");
    
    // Create custom mock chainable interface matching actual methods used in mockDb
    const mockQueryBuilder: MockQueryBuilder = {
      select: () => mockQueryBuilder,
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => mockQueryBuilder,
      single: () => Promise.resolve({ data: null, error: null }),
      contains: () => mockQueryBuilder,
      or: () => Promise.resolve({ data: [], error: null }),
      update: () => mockQueryBuilder,
      insert: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
      then: (onfulfilled) => onfulfilled({ data: [], error: null })
    };

    supabaseInstance = {
      from: () => mockQueryBuilder,
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithOtp: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as unknown as SupabaseClient;
  } else {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.error("🚨 Failed to initialize Supabase client:", err);
      // Fallback mock to prevent crashing
      const mockQueryBuilder: MockQueryBuilder = {
        select: () => mockQueryBuilder,
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => mockQueryBuilder,
        single: () => Promise.resolve({ data: null, error: null }),
        contains: () => mockQueryBuilder,
        or: () => Promise.resolve({ data: [], error: null }),
        update: () => mockQueryBuilder,
        insert: () => mockQueryBuilder,
        delete: () => mockQueryBuilder,
        then: (onfulfilled) => onfulfilled({ data: [], error: null })
      };
      supabaseInstance = {
        from: () => mockQueryBuilder,
        auth: {
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithOtp: () => Promise.resolve({ error: null }),
          signOut: () => Promise.resolve({ error: null })
        }
      } as unknown as SupabaseClient;
    }
  }
  return supabaseInstance;
};

// Export Proxy typed as SupabaseClient to route method calls dynamically
export const supabase: SupabaseClient = new Proxy({} as unknown as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient() as unknown as Record<string, unknown>;
    const value = client[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
