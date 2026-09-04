"use client";

import { AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";

interface ConsistencyViewProps {
  consistencyScore: number;
  issues: Array<{
    rule: string;
    slide_a: string;
    slide_b: string;
    description: string;
    severity: string;
    fix?: string;
  }>;
  onRerun: () => void;
  isRerunning: boolean;
}

export function ConsistencyView({
  consistencyScore,
  issues,
  onRerun,
  isRerunning,
}: ConsistencyViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
            {Math.round(consistencyScore || 90)}%
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cross-Slide Narrative & Mathematical Integrity</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Validates that enterprise pricing aligns with customer segments, hiring capacity matches SOM targets, and runway matches monthly burn.
            </p>
          </div>
        </div>

        <button
          onClick={onRerun}
          disabled={isRerunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRerunning ? "animate-spin" : ""}`} />
          Run Consistency Audit
        </button>
      </div>

      {/* Issues List */}
      {issues && issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map((issue, idx) => (
            <div key={idx} className="glass-panel rounded-xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  {issue.rule}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{issue.slide_a}</span>
                  <span>⟷</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{issue.slide_b}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{issue.description}</p>

              {issue.fix && (
                <div className="pt-2 border-t border-white/5 text-[11px] text-brand-cyan">
                  <span className="font-semibold text-slate-400">Suggested Fix: </span>
                  {issue.fix}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-emerald-500/20 bg-emerald-500/[0.02]">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">Zero Logical Inconsistencies Detected</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your customer persona, contract pricing, sales hiring capacity, and cash runway are in complete mathematical alignment.
          </p>
        </div>
      )}
    </div>
  );
}
