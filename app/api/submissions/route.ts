import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use server-side Supabase client to avoid exposing keys
function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, key);
}

// POST - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { raw_text, audio_url, image_url, ward } = body;

    // Validate required fields
    if (!ward || typeof ward !== "string" || ward.trim().length === 0) {
      return Response.json(
        { error: "Ward is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // At least one input must be provided
    if (!raw_text && !audio_url) {
      return Response.json(
        { error: "At least one of raw_text or audio_url must be provided." },
        { status: 400 }
      );
    }

    // Validate types
    if (raw_text !== null && raw_text !== undefined && typeof raw_text !== "string") {
      return Response.json(
        { error: "raw_text must be a string or null." },
        { status: 400 }
      );
    }

    if (audio_url !== null && audio_url !== undefined && typeof audio_url !== "string") {
      return Response.json(
        { error: "audio_url must be a string or null." },
        { status: 400 }
      );
    }

    if (image_url !== null && image_url !== undefined && typeof image_url !== "string") {
      return Response.json(
        { error: "image_url must be a string or null." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        raw_text: raw_text || null,
        audio_url: audio_url || null,
        image_url: image_url || null,
        ward: ward.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Submission created successfully", submission: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/submissions error:", error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

// GET - List all submissions, newest first
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase select error:", error);
      return Response.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({ submissions: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
