import { SupabaseClient } from "@supabase/supabase-js";

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

export const supabase: SupabaseClient = createMockSupabase();
