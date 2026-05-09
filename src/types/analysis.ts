export type Improvement = {
  dimension: string;
  dimension_score: number;
  issue: string;
  suggestion: string;
  before?: string;
  after?: string;
};

export type Strength = {
  dimension: string;
  dimension_score: number;
  detail: string;
};

export type AnalysisResult = {
  detected_language: string;
  inferred_role?: string;
  score: { total: number; summary: string };
  analysis: {
    improvements: Improvement[];
    strengths: Strength[];
  };
  improved_cv: { text: string; changes: string[] };
};

// Used during streaming, before the full result has arrived.
// Every leaf is optional; sub-fields fill in independently as they parse.
export type PartialResult = Partial<{
  detected_language: string;
  inferred_role: string;
  score: Partial<{ total: number; summary: string }>;
  analysis: Partial<{ improvements: Improvement[]; strengths: Strength[] }>;
  improved_cv: Partial<{ text: string; changes: string[] }>;
}>;
