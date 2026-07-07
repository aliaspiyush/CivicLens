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
  created_at: string;
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
