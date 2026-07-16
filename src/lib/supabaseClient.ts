import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key-string";

const isValidKey = (token: string): boolean => {
  if (typeof token !== "string") return false;
  return token.startsWith("sb_publishable_") || token.split(".").length === 3;
};

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

const createMockSupabase = (): SupabaseClient => {
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

export const supabase: SupabaseClient = isValidKey(supabaseAnonKey) && supabaseUrl.startsWith("http")
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        detectSessionInUrl: typeof window !== "undefined",
      },
    })
  : createMockSupabase();
