import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key);
}

/**
 * GET /api/reference-data
 * Query params: ?ward=...&category=...
 * Returns matching reference data rows.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ward = searchParams.get("ward");
    const category = searchParams.get("category");

    const supabase = getSupabaseServer();

    let query = supabase
      .from("reference_data")
      .select("*")
      .order("category", { ascending: true })
      .order("metric_name", { ascending: true });

    if (ward) {
      query = query.eq("ward", ward);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Supabase reference_data select error:", error);
      return Response.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({ reference_data: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/reference-data error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
