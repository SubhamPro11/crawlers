import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect /api routes
  if (path.startsWith("/api")) {
    // Allow CORS OPTIONS preflight
    if (request.method === "OPTIONS") {
      return NextResponse.next();
    }

    const authHeader = request.headers.get("Authorization");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    let isAuthenticated = false;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });

        // 1. Check Bearer token in Authorization header
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.replace("Bearer ", "").trim();
          const { data } = await supabase.auth.getUser(token);
          if (data && data.user) {
            isAuthenticated = true;
          }
        }

        // 2. Check auth cookies if present
        if (!isAuthenticated) {
          const authCookie = request.cookies.get("sb-access-token")?.value || 
                             request.cookies.get("supabase-auth-token")?.value;
          if (authCookie) {
            const { data } = await supabase.auth.getUser(authCookie);
            if (data && data.user) {
              isAuthenticated = true;
            }
          }
        }
      } catch (err) {
        console.error("Middleware auth verification error:", err);
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "API access requires an active sign-in. Please sign in at crawlers.dpdns.org to obtain an authenticated session.",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
