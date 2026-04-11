"use client";

import { useCallback, useReducer, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";
import type { ErrorReason, Phase, UIState } from "@/types/ui-state";
import { screenVariants } from "@/lib/motion-presets";
import UploadScreen from "./UploadScreen";
import AnalyzingScreen from "./AnalyzingScreen";
import RevealScreen from "./RevealScreen";
import ResultScreen from "./ResultScreen";
import ErrorState from "./ErrorState";

type Action =
  | { type: "edit"; cvText: string; targetRole: string }
  | { type: "start"; abort: () => void }
  | { type: "phase"; id: Phase["id"] }
  | { type: "tokens"; tokens: number }
  | { type: "result"; result: AnalysisResult }
  | { type: "reveal_done" }
  | { type: "tab"; tab: "diagnosis" | "rewrite" | "diff" }
  | { type: "error"; reason: ErrorReason; canRetry: boolean }
  | { type: "reset" };

const INITIAL_PHASES: Phase[] = [
  { id: "read", label: "Leído", status: "pending" },
  { id: "analyze", label: "Analizado", status: "pending" },
  { id: "rewrite", label: "Reescribiendo", status: "pending" },
  { id: "format", label: "Formateando", status: "pending" },
];

function reducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case "edit":
      if (action.cvText.trim().length >= 50) {
        return {
          kind: "ready",
          cvText: action.cvText,
          targetRole: action.targetRole,
        };
      }
      return { kind: "idle" };

    case "start":
      return {
        kind: "analyzing",
        phases: INITIAL_PHASES.map((p, i) =>
          i === 0 ? { ...p, status: "active", startedAt: Date.now() } : p,
        ),
        tokens: 0,
        startedAt: Date.now(),
        abort: action.abort,
      };

    case "phase": {
      if (state.kind !== "analyzing") return state;
      const now = Date.now();
      const idx = state.phases.findIndex((p) => p.id === action.id);
      if (idx === -1) return state;
      return {
        ...state,
        phases: state.phases.map((p, i) => {
          if (i < idx)
            return {
              ...p,
              status: "done",
              completedAt: p.completedAt ?? now,
            };
          if (i === idx)
            return { ...p, status: "done", completedAt: now };
          if (i === idx + 1)
            return { ...p, status: "active", startedAt: now };
          return p;
        }),
      };
    }

    case "tokens":
      if (state.kind !== "analyzing") return state;
      return { ...state, tokens: action.tokens };

    case "result":
      return { kind: "revealing", result: action.result };

    case "reveal_done":
      if (state.kind !== "revealing") return state;
      return {
        kind: "result",
        result: state.result,
        activeTab: "diagnosis",
      };

    case "tab":
      if (state.kind !== "result") return state;
      return { ...state, activeTab: action.tab };

    case "error":
      return {
        kind: "error",
        reason: action.reason,
        canRetry: action.canRetry,
      };

    case "reset":
      return { kind: "idle" };
  }
}

export default function AnalysisFlow() {
  const [state, dispatch] = useReducer(reducer, { kind: "idle" } as UIState);
  const lastCvRef = useRef<string>("");
  const lastRoleRef = useRef<string>("");

  const runAnalysis = useCallback(
    async (cvText: string, targetRole: string) => {
      lastCvRef.current = cvText;
      lastRoleRef.current = targetRole;
      const controller = new AbortController();
      dispatch({ type: "start", abort: () => controller.abort() });

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvText,
            targetRole: targetRole || undefined,
          }),
          signal: controller.signal,
        });

        if (res.status === 429) {
          dispatch({ type: "error", reason: "rate_limit", canRetry: false });
          return;
        }
        if (res.status === 400) {
          dispatch({ type: "error", reason: "too_short", canRetry: true });
          return;
        }
        if (!res.ok || !res.body) {
          dispatch({ type: "error", reason: "api_error", canRetry: true });
          return;
        }

        dispatch({ type: "phase", id: "read" });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let firstToken = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (currentEvent === "progress") {
                  if (!firstToken && (data.tokens ?? 0) > 0) {
                    firstToken = true;
                    dispatch({ type: "phase", id: "analyze" });
                  }
                  dispatch({ type: "tokens", tokens: data.tokens ?? 0 });
                } else if (currentEvent === "result") {
                  dispatch({ type: "phase", id: "rewrite" });
                  dispatch({ type: "phase", id: "format" });
                  dispatch({ type: "result", result: data });
                } else if (currentEvent === "error") {
                  dispatch({
                    type: "error",
                    reason:
                      data.error === "parse_error"
                        ? "invalid_output"
                        : "api_error",
                    canRetry: true,
                  });
                  return;
                }
              } catch {
                /* ignore */
              }
              currentEvent = "";
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          dispatch({ type: "reset" });
          return;
        }
        dispatch({ type: "error", reason: "network", canRetry: true });
      }
    },
    [],
  );

  // Progress 0..1 driven by rough token count for the ring fill (no number exposed)
  const progress =
    state.kind === "analyzing" ? Math.min(0.95, state.tokens / 2400) : 0;

  return (
    <div className="relative min-h-screen bg-white text-ink-900">
      <AnimatePresence mode="wait" initial={false}>
        {(state.kind === "idle" || state.kind === "ready") && (
          <motion.div
            key="upload"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <UploadScreen
              initial={state.kind === "ready" ? state : undefined}
              onEdit={(cv, role) =>
                dispatch({ type: "edit", cvText: cv, targetRole: role })
              }
              onSubmit={(cv, role) => runAnalysis(cv, role)}
            />
          </motion.div>
        )}

        {state.kind === "analyzing" && (
          <motion.div
            key="analyzing"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <AnalyzingScreen
              phases={state.phases}
              progress={progress}
              onCancel={state.abort}
            />
          </motion.div>
        )}

        {state.kind === "revealing" && (
          <motion.div
            key="revealing"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <RevealScreen
              result={state.result}
              onComplete={() => dispatch({ type: "reveal_done" })}
            />
          </motion.div>
        )}

        {state.kind === "result" && (
          <motion.div
            key="result"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <ResultScreen
              result={state.result}
              originalText={lastCvRef.current}
              activeTab={state.activeTab}
              onTab={(tab) => dispatch({ type: "tab", tab })}
              onReset={() => dispatch({ type: "reset" })}
            />
          </motion.div>
        )}

        {state.kind === "error" && (
          <motion.div
            key="error"
            variants={screenVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <ErrorState
              reason={state.reason}
              canRetry={state.canRetry}
              onReset={() => dispatch({ type: "reset" })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
