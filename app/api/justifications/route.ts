import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateJustification } from "@/lib/gemini";
import { z } from "zod";
import type { ReferenceData, DevelopmentPlan } from "@/types";

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key);
}

// --- Request body validation ---
const justificationRequestSchema = z.object({
  theme_id: z.string().uuid(),
  theme_title: z.string().min(1),
  theme_category: z.string().min(1),
  theme_ward: z.string().min(1),
  submission_count: z.number().int().positive(),
  avg_urgency: z.number().min(1).max(5),
  citizen_summaries: z.array(z.string()).min(1).max(20),
});

/**
 * POST /api/justifications
 * Triggers Gemini justification for a theme.
 * Fetches reference_data and development_plans from Supabase,
 * sends to Gemini, stores result in justifications table.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = justificationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return Response.json(
        { error: `Validation error: ${issues}` },
        { status: 400 }
      );
    }

    const params = parseResult.data;
    const supabase = getSupabaseServer();

    // Fetch reference data for this ward/category
    const { data: refData, error: refError } = await supabase
      .from("reference_data")
      .select("*")
      .eq("ward", params.theme_ward)
      .eq("category", params.theme_category);

    if (refError) {
      console.error("Failed to fetch reference_data:", refError);
      return Response.json(
        { error: `Failed to fetch reference data: ${refError.message}` },
        { status: 500 }
      );
    }

    // Fetch development plans for this ward/category
    const { data: devPlans, error: devError } = await supabase
      .from("development_plans")
      .select("*")
      .eq("ward", params.theme_ward)
      .eq("category", params.theme_category);

    if (devError) {
      console.error("Failed to fetch development_plans:", devError);
      return Response.json(
        { error: `Failed to fetch development plans: ${devError.message}` },
        { status: 500 }
      );
    }

    // Call Gemini for justification
    const geminiResult = await generateJustification({
      themeTitle: params.theme_title,
      themeCategory: params.theme_category,
      themeWard: params.theme_ward,
      submissionCount: params.submission_count,
      avgUrgency: params.avg_urgency,
      citizenSummaries: params.citizen_summaries,
      referenceData: (refData ?? []) as ReferenceData[],
      developmentPlans: (devPlans ?? []) as DevelopmentPlan[],
    });

    // Find competing plan ID if a plan was mentioned
    let competingPlanId: string | null = null;
    if (geminiResult.competing_plan_summary && devPlans && devPlans.length > 0) {
      // Use the first matching plan as the competing plan
      competingPlanId = devPlans[0].id;
    }

    // Build reference data summary for storage
    const referenceDataUsed = (refData ?? []).map((r: ReferenceData) => ({
      metric_name: r.metric_name,
      metric_value: r.metric_value,
      unit: r.unit,
      source: r.source,
    }));

    // Upsert into justifications table (one justification per theme)
    const { data: justification, error: insertError } = await supabase
      .from("justifications")
      .upsert(
        {
          theme_id: params.theme_id,
          justification_score: geminiResult.justification_score,
          rationale_text: geminiResult.rationale_text,
          competing_plan_id: competingPlanId,
          reference_data_used: referenceDataUsed,
        },
        { onConflict: "theme_id" }
      )
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store justification:", insertError);
      return Response.json(
        { error: `Failed to store justification: ${insertError.message}` },
        { status: 500 }
      );
    }

    return Response.json(
      {
        message: "Justification generated successfully",
        justification,
        gemini_result: geminiResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/justifications error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/justifications
 * Query params: ?theme_id=...
 * Returns justification(s).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const themeId = searchParams.get("theme_id");

    const supabase = getSupabaseServer();

    let query = supabase
      .from("justifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (themeId) {
      query = query.eq("theme_id", themeId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Supabase justifications select error:", error);
      return Response.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({ justifications: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/justifications error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
