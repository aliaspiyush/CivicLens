import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractSubmissionData, generateJustification } from "@/lib/gemini";
import fs from "fs";
import path from "path";
import { ReferenceData, DevelopmentPlan, Submission } from "@/types";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase variables" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch unreviewed submissions
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select("*")
      // .eq("status", "new") // Optional: remove if you want to re-process all
      .limit(10);

    if (subError || !submissions || submissions.length === 0) {
      return NextResponse.json({ error: "No submissions found to synthesize." }, { status: 400 });
    }

    // 2. Pick a subset (max 5) to avoid Vercel timeouts (15s limit)
    const demoBatch = submissions.slice(0, 5);

    // 3. Extract meaning using Gemini for each submission
    const extractionPromises = demoBatch.map(async (sub) => {
      // Fallback text if raw_text is missing but audio exists (mock transcription)
      const textToAnalyze = sub.raw_text || "Citizen submitted an audio complaint about civic issues.";
      const extracted = await extractSubmissionData(textToAnalyze);
      return { ...sub, extracted };
    });

    const processedSubmissions = await Promise.all(extractionPromises);

    // 4. Group by Ward and Category (Simple Clustering)
    const clusters: Record<string, typeof processedSubmissions> = {};
    for (const ps of processedSubmissions) {
      const key = `${ps.ward}|${ps.extracted.category}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(ps);
    }

    // Pick the largest cluster to form a Theme
    let largestClusterKey = "";
    let maxCount = 0;
    for (const key in clusters) {
      if (clusters[key].length > maxCount) {
        maxCount = clusters[key].length;
        largestClusterKey = key;
      }
    }

    const topCluster = clusters[largestClusterKey];
    const [ward, category] = largestClusterKey.split("|");

    // 5. Load Reference Data & Development Plans
    const refDataPath = path.join(process.cwd(), "public", "data", "reference_data.json");
    const plansPath = path.join(process.cwd(), "public", "data", "development_plans.json");
    
    let referenceData: ReferenceData[] = [];
    let developmentPlans: DevelopmentPlan[] = [];
    
    try {
      referenceData = JSON.parse(fs.readFileSync(refDataPath, "utf-8")).filter((r: ReferenceData) => r.ward === ward && r.category === category);
      developmentPlans = JSON.parse(fs.readFileSync(plansPath, "utf-8")).filter((p: DevelopmentPlan) => p.ward === ward && p.category === category);
    } catch (e) {
      console.error("Failed to load local static data", e);
    }

    // 6. Generate Justification
    const avgUrgency = topCluster.reduce((sum, item) => sum + item.extracted.priority_score, 0) / topCluster.length;
    const citizenSummaries = topCluster.map((c) => c.extracted.summary);

    const justification = await generateJustification({
      themeTitle: `Address ${category} issues in ${ward}`,
      themeCategory: category,
      themeWard: ward,
      submissionCount: topCluster.length,
      avgUrgency,
      citizenSummaries,
      referenceData,
      developmentPlans,
    });

    // 7. Calculate final composite score
    const priorityScore = (avgUrgency * 0.25) + (justification.justification_score * 0.45) + (Math.min(topCluster.length, 50) * 0.1);

    const themePayload = {
      title: `Address ${category} issues in ${ward}`,
      category,
      ward,
      submission_count: topCluster.length,
      priority_score: priorityScore,
      justification_score: justification.justification_score,
      rationale_text: justification.rationale_text,
      validation_passed: justification.validation_passed,
    };

    // 8. Attempt to save to `themes` table (fails gracefully if table doesn't exist)
    try {
      await supabase.from("themes").insert(themePayload);
    } catch (e) {
      console.log("Themes table might not exist yet. Error:", e);
    }

    return NextResponse.json({
      message: "Synthesis complete",
      theme: themePayload,
      processed_count: topCluster.length
    });

  } catch (error) {
    console.error("Synthesis error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
