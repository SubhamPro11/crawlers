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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (onfulfilled: any) => onfulfilled({ data: [], error: null })
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Browser environment - always try to use the build-time baked env variables
  if (typeof window !== "undefined") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (isValidKey(key) && url.startsWith("http")) {
      try {
        supabaseInstance = createClient(url, key, {
          auth: {
            persistSession: true,
            detectSessionInUrl: true,
          },
        });
        return supabaseInstance;
      } catch (err) {
        console.error("Browser Supabase init failed:", err);
      }
    }
    return createMockSupabase();
  }

  // Server/Edge environment
  // At startup/module evaluation, process is undefined. Return mock client to prevent crash.
  if (typeof process === "undefined" || !process.env) {
    return createMockSupabase();
  }

  // At request time, process is defined by Next.js edge runtime
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (isValidKey(key) && url.startsWith("http")) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
          detectSessionInUrl: false,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.error("Server Supabase init failed:", err);
    }
  }
  
  return createMockSupabase();
};

export const supabase: SupabaseClient = new Proxy({} as unknown as SupabaseClient, {
  get: (target, prop) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = getSupabaseClient() as unknown as Record<string, any>;
    const value = client[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
