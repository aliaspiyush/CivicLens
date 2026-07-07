export interface Ward {
  id: string;
  name: string;
  zone: string;
  description: string;
}

export interface Submission {
  id: string;
  raw_text: string | null;
  audio_url: string | null;
  image_url: string | null;
  ward: string;
  created_at: string;
}

export interface ProcessedSubmission {
  id: string;
  language: string;
  english_translation: string | null;
  summary: string;
  category: string;
  priority_score: number;
  urgency_reasoning: string;
  detected_sentiment: string;
  latitude: number | null;
  longitude: number | null;
  extracted_entities: ExtractedEntity[];
  theme_id: string | null;
  processed_at: string;
}

export interface ExtractedEntity {
  name: string;
  type: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  category: string;
  ward: string;
  submission_count: number;
  avg_urgency: number;
  created_at: string;
}

export interface ReferenceData {
  id: string;
  category: string;
  ward: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  source: string;
  year: number;
  created_at: string;
}

export interface DevelopmentPlan {
  id: string;
  ward: string;
  proposed_work: string;
  category: string;
  estimated_budget_lakhs: number | null;
  justification_notes: string;
  status: "proposed" | "approved" | "in_progress" | "completed";
  plan_source: string;
  created_at: string;
}

export interface Justification {
  id: string;
  theme_id: string;
  justification_score: number;
  rationale_text: string;
  competing_plan_id: string | null;
  reference_data_used: ReferenceDataSummary[];
  created_at: string;
}

export interface ReferenceDataSummary {
  metric_name: string;
  metric_value: number;
  unit: string;
  source: string;
}

export interface GeminiExtractionResult {
  language: string;
  english_translation: string;
  summary: string;
  category: string;
  priority_score: number;
  urgency_reasoning: string;
  detected_sentiment: string;
  location_coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  extracted_entities: ExtractedEntity[];
}

export interface GeminiJustificationResult {
  justification_score: number;
  rationale_text: string;
  competing_plan_summary: string;
  data_alignment: "strongly_supports" | "partially_supports" | "contradicts" | "insufficient_data";
}

export interface CompositeScore {
  theme_id: string;
  frequency_score: number;
  urgency_score: number;
  justification_score: number;
  composite_priority_score: number;
}

export interface ThemeWithJustification extends Theme {
  justification: Justification | null;
  composite_score: CompositeScore | null;
}
