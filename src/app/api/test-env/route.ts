import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", message: "hello world" }), {
    status: 200,
    headers: {
      "content-type": "application/json"
    }
  });
}
