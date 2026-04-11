import type { AnalysisResult } from "@/types/analysis";

export type PhaseId = "read" | "analyze" | "rewrite" | "format";

export interface Phase {
  id: PhaseId;
  label: string;
  status: "pending" | "active" | "done";
  startedAt?: number;
  completedAt?: number;
}

export type UIState =
  | { kind: "idle" }
  | { kind: "ready"; cvText: string; targetRole: string }
  | {
      kind: "analyzing";
      phases: Phase[];
      tokens: number;
      startedAt: number;
      abort: () => void;
    }
  | { kind: "revealing"; result: AnalysisResult }
  | { kind: "result"; result: AnalysisResult; activeTab: ResultTab }
  | { kind: "error"; reason: ErrorReason; canRetry: boolean };

export type ResultTab = "diagnosis" | "rewrite" | "diff";

export type ErrorReason =
  | "rate_limit"
  | "pdf_parse"
  | "too_short"
  | "timeout"
  | "network"
  | "api_error"
  | "invalid_output";
