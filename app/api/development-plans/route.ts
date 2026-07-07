import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key);
}

/**
 * GET /api/development-plans
 * Query params: ?ward=...&category=...&status=...
 * Returns matching development plan entries.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ward = searchParams.get("ward");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const supabase = getSupabaseServer();

    let query = supabase
      .from("development_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (ward) {
      query = query.eq("ward", ward);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Supabase development_plans select error:", error);
      return Response.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({ development_plans: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/development-plans error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
