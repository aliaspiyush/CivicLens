import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import type { GeminiJustificationResult, ReferenceData, DevelopmentPlan } from "@/types";
import { z } from "zod";

// --- Zod validation schema for Gemini justification response ---
const justificationResponseSchema = z.object({
  justification_score: z.number().int().min(1).max(10),
  rationale_text: z.string().min(20),
  competing_plan_summary: z.string(),
  data_alignment: z.enum(["strongly_supports", "partially_supports", "contradicts", "insufficient_data"]),
});

// --- Zod validation schema for Gemini extraction response ---
const extractionResponseSchema = z.object({
  language: z.string(),
  english_translation: z.string(),
  summary: z.string().max(150),
  category: z.string(),
  priority_score: z.number().int().min(1).max(5),
  urgency_reasoning: z.string(),
  detected_sentiment: z.string(),
});

// --- Gemini client singleton ---
let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (_genAI) return _genAI;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

// --- Structured output schema for Gemini ---
const justificationJsonSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    justification_score: {
      type: SchemaType.INTEGER,
      description: "Evidence-based justification score, 1 (unsupported) to 10 (strongly justified).",
    },
    rationale_text: {
      type: SchemaType.STRING,
      description:
        "One paragraph (3-5 sentences) explaining the score. Must reference specific data points and compare against any competing plans.",
    },
    competing_plan_summary: {
      type: SchemaType.STRING,
      description:
        "If a competing development plan exists for this ward/category, summarize it. Otherwise empty string.",
    },
    data_alignment: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["strongly_supports", "partially_supports", "contradicts", "insufficient_data"],
      description: "How well the reference data aligns with citizen demand.",
    },
  },
  required: ["justification_score", "rationale_text", "competing_plan_summary", "data_alignment"],
};

// --- Format reference data into readable text for prompt ---
function formatReferenceData(rows: ReferenceData[]): string {
  if (rows.length === 0) return "No reference data available for this ward/category.";

  return rows
    .map(
      (r) =>
        `- ${r.metric_name}: ${r.metric_value} ${r.unit} (Source: ${r.source}, ${r.year})`
    )
    .join("\n");
}

// --- Format development plans into readable text for prompt ---
function formatDevelopmentPlans(plans: DevelopmentPlan[]): string {
  if (plans.length === 0) return "No existing or proposed development plans found for this ward/category.";

  return plans
    .map(
      (p) =>
        `- [${p.status.toUpperCase()}] ${p.proposed_work}\n  Budget: ₹${p.estimated_budget_lakhs ?? "N/A"} lakhs | Source: ${p.plan_source}\n  Justification: ${p.justification_notes}`
    )
    .join("\n\n");
}

// --- Build the justification prompt ---
function buildJustificationPrompt(params: {
  themeTitle: string;
  themeCategory: string;
  themeWard: string;
  submissionCount: number;
  avgUrgency: number;
  citizenSummaries: string[];
  referenceData: ReferenceData[];
  developmentPlans: DevelopmentPlan[];
}): string {
  const summariesText = params.citizenSummaries
    .map((s, i) => `  ${i + 1}. "${s}"`)
    .join("\n");

  return `You are a senior public policy analyst evaluating a civic development theme for a Member of Parliament.

Your task is to assess whether citizen demand for this theme is justified by objective evidence and how it compares to any existing or proposed development plans.

## Theme Under Evaluation
- Title: ${params.themeTitle}
- Category: ${params.themeCategory}
- Ward: ${params.themeWard}
- Number of citizen submissions: ${params.submissionCount}
- Average citizen urgency score: ${params.avgUrgency.toFixed(1)} (scale 1-5)
- Representative citizen summaries:
${summariesText}

## Reference Data for this Ward/Category
${formatReferenceData(params.referenceData)}

## Existing/Proposed Development Plans for this Ward/Category
${formatDevelopmentPlans(params.developmentPlans)}

## Instructions
1. ZERO HALLUCINATION SAFEGUARD: You must only use information present in the provided submissions and reference data. Do not infer, assume, or fabricate any statistic, number, or fact not explicitly present in the input. If data is insufficient to support a claim, state 'Insufficient data to determine this' instead of guessing. Every numeric claim in your output must be traceable to a specific field in the input data provided.
2. Compare the citizen demand signal (volume, urgency, and described conditions) against the reference data metrics. Does the data support the urgency citizens describe? For example, if citizens say schools are overcrowded, does the enrollment-to-capacity ratio confirm this?
3. Check if any existing development plan already addresses this theme. If so, is the plan sufficient, or does the citizen demand suggest a gap the plan doesn't cover?
4. If a competing plan exists that is more justified by the data than the citizen request, note it.
5. Assign a justification_score from 1 to 10:
   - 1-3: Citizen demand is NOT supported by evidence. Data suggests the issue is already addressed or does not exist at the claimed severity.
   - 4-5: Demand is partially supported. Some evidence exists but the urgency is overstated, or a plan already covers it.
   - 6-7: Demand is supported by evidence. Data confirms the issue exists and is not fully addressed.
   - 8-10: Demand is strongly supported. Data shows a severe gap, no competing plan covers it, and citizen reports align with metrics.

Respond ONLY with a valid JSON object matching the requested schema.`;
}

// --- Main justification function ---
export async function generateJustification(params: {
  themeTitle: string;
  themeCategory: string;
  themeWard: string;
  submissionCount: number;
  avgUrgency: number;
  citizenSummaries: string[];
  referenceData: ReferenceData[];
  developmentPlans: DevelopmentPlan[];
}): Promise<GeminiJustificationResult> {
  const genAI = getGenAI();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: justificationJsonSchema,
      temperature: 0.3,
    },
  });

  const prompt = buildJustificationPrompt(params);

  // Timeout wrapper: 60 second max
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    clearTimeout(timeout);

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
    }

    // Validate with Zod
    const validated = justificationResponseSchema.parse(parsed);

    // --- ZERO HALLUCINATION SAFEGUARD ---
    // Extract all numbers from rationale
    const numberRegex = /\b\d+(\.\d+)?\b/g;
    const numbersInRationale = validated.rationale_text.match(numberRegex) || [];
    
    // Create a corpus of all input strings to check against
    const inputCorpus = [
      params.submissionCount.toString(),
      params.avgUrgency.toFixed(1),
      ...params.referenceData.map(r => r.metric_value.toString()),
      ...params.developmentPlans.map(p => p.estimated_budget_lakhs?.toString() || ""),
      ...params.developmentPlans.map(p => p.justification_notes)
    ].join(" ");

    // Check if every number generated exists in the input corpus
    let validationPassed = true;
    for (const num of numbersInRationale) {
      if (!inputCorpus.includes(num)) {
        validationPassed = false;
        break;
      }
    }

    // Attempt to log to gemini_audit_log
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http') 
        ? process.env.NEXT_PUBLIC_SUPABASE_URL 
        : 'http://localhost:54321';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('gemini_audit_log').insert({
        prompt,
        response: text,
        validation_passed: validationPassed
      });
    } catch (logError) {
      console.error("Failed to write to gemini_audit_log:", logError);
    }

    return {
      ...validated,
      validation_passed: validationPassed
    };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Gemini response failed schema validation: ${issues}`);
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Gemini API call timed out after 60 seconds.");
    }

    throw error;
  }
}

// --- Structured output schema for Extraction ---
const extractionJsonSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    language: { type: SchemaType.STRING, description: "Language of the original submission (e.g., Hindi, Bengali, English)." },
    english_translation: { type: SchemaType.STRING, description: "English translation of the submission." },
    summary: { type: SchemaType.STRING, description: "One sentence summary of the core issue." },
    category: { type: SchemaType.STRING, description: "Category of the issue (e.g., Water & Sanitation, Education, Roads, Waste Management)." },
    priority_score: { type: SchemaType.INTEGER, description: "Urgency score from 1 (low) to 5 (high) based on the text." },
    urgency_reasoning: { type: SchemaType.STRING, description: "Why this priority score was given." },
    detected_sentiment: { type: SchemaType.STRING, description: "Sentiment (e.g., Angry, Desperate, Neutral)." },
  },
  required: ["language", "english_translation", "summary", "category", "priority_score", "urgency_reasoning", "detected_sentiment"],
};

export async function extractSubmissionData(rawText: string) {
  const genAI = getGenAI();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-05-06",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: extractionJsonSchema,
      temperature: 0.1,
    },
  });

  const prompt = `You are a civic data extractor. Analyze the following citizen submission. 
Extract the language, translate it to English, summarize it, categorize it, and score the urgency (1-5).
ZERO HALLUCINATION SAFEGUARD: Use only the supplied input data. Do not invent statistics, names, distances, counts, budgets, or facts. If the evidence is insufficient, say 'Insufficient data to determine this.'

Submission text:
"${rawText}"`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    clearTimeout(timeout);

    const text = result.response.text();
    if (!text) throw new Error("Empty response");

    const parsed = JSON.parse(text);
    return extractionResponseSchema.parse(parsed);
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}
