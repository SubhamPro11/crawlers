import { NextResponse } from "next/server";
import { mockDb } from "@/data/mockDb";

export const runtime = "edge";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "not set";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "not set";
    
    return NextResponse.json({
      urlExists: url !== "not set",
      urlLength: url.length,
      urlPrefix: url.substring(0, 15),
      keyExists: key !== "not set",
      keyLength: key.length,
      keyPrefix: key.substring(0, 15),
      processEnvKeys: typeof process !== "undefined" && process.env ? Object.keys(process.env).filter(k => k.startsWith("NEXT_PUBLIC_")) : [],
    }, {
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
