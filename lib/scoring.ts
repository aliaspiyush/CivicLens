import type { CompositeScore } from "@/types";

/**
 * Composite Priority Score Formula:
 *
 *   composite = (0.30 × norm_frequency) + (0.25 × norm_urgency) + (0.45 × norm_justification)
 *
 * - Frequency (submission_count): min-max normalized across all themes, scaled 0-10
 * - Urgency (avg_priority_score): scale 1-5 → mapped to 0-10
 * - Justification (justification_score): already 1-10
 *
 * Justification has the HIGHEST weight (45%) to ensure evidence-backed themes
 * outrank high-volume but unsupported complaints.
 */

const WEIGHT_FREQUENCY = 0.30;
const WEIGHT_URGENCY = 0.25;
const WEIGHT_JUSTIFICATION = 0.45;

/**
 * Min-max normalize a value to a 0-10 scale.
 */
function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 5; // All equal → midpoint
  return ((value - min) / (max - min)) * 10;
}

/**
 * Map urgency from 1-5 scale to 0-10 scale.
 */
function normalizeUrgency(urgency: number): number {
  return ((urgency - 1) / 4) * 10; // 1→0, 5→10
}

/**
 * Calculate composite priority score for a single theme.
 */
export function calculateCompositeScore(params: {
  themeId: string;
  submissionCount: number;
  avgUrgency: number;
  justificationScore: number;
  allSubmissionCounts: number[];
}): CompositeScore {
  const minCount = Math.min(...params.allSubmissionCounts);
  const maxCount = Math.max(...params.allSubmissionCounts);

  const frequencyScore = minMaxNormalize(params.submissionCount, minCount, maxCount);
  const urgencyScore = normalizeUrgency(params.avgUrgency);
  const justificationScore = params.justificationScore; // Already 1-10

  const composite =
    WEIGHT_FREQUENCY * frequencyScore +
    WEIGHT_URGENCY * urgencyScore +
    WEIGHT_JUSTIFICATION * justificationScore;

  // Round to 2 decimal places
  const roundedComposite = Math.round(composite * 100) / 100;

  return {
    theme_id: params.themeId,
    frequency_score: Math.round(frequencyScore * 100) / 100,
    urgency_score: Math.round(urgencyScore * 100) / 100,
    justification_score: justificationScore,
    composite_priority_score: roundedComposite,
  };
}

/**
 * Calculate composite scores for all themes at once.
 * This is the batch version that correctly normalizes frequency across all themes.
 */
export function calculateAllCompositeScores(
  themes: Array<{
    themeId: string;
    submissionCount: number;
    avgUrgency: number;
    justificationScore: number;
  }>
): CompositeScore[] {
  const allCounts = themes.map((t) => t.submissionCount);

  return themes
    .map((t) =>
      calculateCompositeScore({
        themeId: t.themeId,
        submissionCount: t.submissionCount,
        avgUrgency: t.avgUrgency,
        justificationScore: t.justificationScore,
        allSubmissionCounts: allCounts,
      })
    )
    .sort((a, b) => b.composite_priority_score - a.composite_priority_score);
}
