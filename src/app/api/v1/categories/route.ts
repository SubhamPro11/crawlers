import { NextResponse, type NextRequest } from "next/server";
import { mockDb } from "@/data/mockDb";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    let isAuthenticated = false;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        const { data } = await supabase.auth.getUser(token);
        if (data && data.user) isAuthenticated = true;
      }

      if (!isAuthenticated) {
        const authCookie = request.cookies.get("sb-access-token")?.value || 
                           request.cookies.get("supabase-auth-token")?.value;
        if (authCookie) {
          const { data } = await supabase.auth.getUser(authCookie);
          if (data && data.user) isAuthenticated = true;
        }
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "API access requires an active sign-in. Please sign in at crawlers.dpdns.org to obtain an authenticated session.",
        },
        { status: 401 }
      );
    }

    const categories = await mockDb.getCategories();
    return NextResponse.json(categories, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("API error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
