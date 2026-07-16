import { createClient, SupabaseClient } from "@supabase/supabase-js";

const isValidKey = (token: string): boolean => {
  if (typeof token !== "string") return false;
  return token.startsWith("sb_publishable_") || token.split(".").length === 3;
};

const createMockSupabase = (): SupabaseClient => {
  const mockQueryBuilderObj = {
    order: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    or: () => Promise.resolve({ data: [], error: null }),
    then: (onfulfilled: any) => onfulfilled({ data: [], error: null })
  };

  const mockQueryBuilder: any = new Proxy(mockQueryBuilderObj, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      return () => mockQueryBuilder;
    }
  });

  return {
    from: () => mockQueryBuilder,
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => Promise.resolve({ data: { provider: "", url: "" }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  } as unknown as SupabaseClient;
};

let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-url.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key-string";

  const isPlaceholder = !isValidKey(key) || !url.startsWith("http");

  if (isPlaceholder) {
    supabaseInstance = createMockSupabase();
  } else {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: typeof window !== "undefined",
          detectSessionInUrl: false, // Prevent location-based auto-detect session crashes in edge workers
        },
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      supabaseInstance = createMockSupabase();
    }
  }
  return supabaseInstance;
};

export const supabase: SupabaseClient = new Proxy({} as unknown as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient() as unknown as Record<string, any>;
    const value = client[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
