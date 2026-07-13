import { createClient, SupabaseClient } from "@supabase/supabase-js";

const getEnv = (key: string): string => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || "";
  }
  return "";
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL") || "https://placeholder-project-url.supabase.co";
const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "placeholder-anon-key-string";

const isValidJwt = (token: string): boolean => {
  return typeof token === "string" && token.split(".").length === 3;
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
      signOut: () => Promise.resolve({ error: null })
    }
  } as unknown as SupabaseClient;
};

export const supabase: SupabaseClient = isValidJwt(supabaseAnonKey) && supabaseUrl.startsWith("http")
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();
