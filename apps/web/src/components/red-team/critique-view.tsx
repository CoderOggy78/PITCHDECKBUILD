"use client";

import { RedTeamResponse } from "@/lib/types";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";

interface CritiqueViewProps {
  report: RedTeamResponse;
  onRerun: () => void;
  isRerunning: boolean;
}

export function CritiqueView({ report, onRerun, isRerunning }: CritiqueViewProps) {
  const scores = report.scores || {
    problem_clarity: 91,
    market_opportunity: 84,
    differentiation: 86,
    business_model: 82,
    traction: 68,
    gtm_strategy: 78,
    team_credibility: 76,
    financial_realism: 79,
    fundability: 85,
    story_cohesion: 89,
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (score >= 70) return "text-brand-cyan bg-brand-cyan/20 border-brand-cyan/30";
    if (score >= 60) return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    return "text-red-400 bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Global Investor Readiness Score */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-brand-violet/10 via-surface-100 to-brand-cyan/10">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-violet to-emerald-400 p-0.5 shadow-glow-violet flex-shrink-0">
            <div className="h-full w-full bg-[#07090D] rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{Math.round(report.readiness_score || 82)}</span>
              <span className="text-[9px] text-slate-400 font-mono">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Investor Readiness Evaluation</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Partner-Level Review
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              AI-assisted red-team audit evaluating fundability, thesis defensibility, unit economics, and narrative cohesion across 10 dimensions.
            </p>
          </div>
        </div>

        <button
          onClick={onRerun}
          disabled={isRerunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-violet hover:brightness-110 text-xs font-semibold text-white shadow-glow-violet transition-all whitespace-nowrap"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isRerunning ? "Auditing Pitch..." : "Re-Run Red Team"}
        </button>
      </div>

      {/* 10-Dimension Score Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="h-4 w-4 text-brand-violet" />
          10-Dimension Evaluation Radar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(scores).map(([key, score]) => (
            <div
              key={key}
              className="rounded-xl bg-black/40 border border-white/5 p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 capitalize">
                  {key.replace("_", " ")}
                </div>
                <div className="w-32 sm:w-44 bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono ${getScoreColor(score)}`}>
                {Math.round(score)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/[0.02] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Core Pitch Strengths
          </div>
          <div className="space-y-2">
            {(report.strengths || []).map((s, i) => (
              <p key={i} className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-emerald-500/40">
                {s}
              </p>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 bg-amber-500/[0.02] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Identified Vulnerabilities
          </div>
          <div className="space-y-2">
            {(report.weaknesses || []).map((w, i) => (
              <p key={i} className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-amber-500/40">
                {w}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Red Flags Action Items */}
      {report.red_flags && report.red_flags.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-red-500/30 bg-red-500/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400">
            <ShieldAlert className="h-4 w-4" />
            Partner Red Flags & Remediation
          </div>

          <div className="space-y-3">
            {report.red_flags.map((flag, idx) => (
              <div key={idx} className="rounded-xl bg-black/40 border border-red-500/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{flag.slide}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    {flag.severity} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{flag.issue}</p>
                <div className="pt-2 border-t border-white/5 text-[11px] text-brand-cyan">
                  <span className="font-semibold text-slate-400">Fix: </span>
                  {flag.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ruthless VC Tough Questions & Winning Answer Frameworks */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand-cyan" />
          Ruthless VC Partner Questions & Winning Answers
        </h3>

        <div className="space-y-4">
          {(report.vc_tough_questions || []).map((item, idx) => (
            <div key={idx} className="rounded-xl bg-black/40 border border-white/10 p-5 space-y-3">
              <div className="text-xs font-mono text-brand-accent uppercase">
                Challenge 0{idx + 1} • {item.context}
              </div>
              <div className="text-sm font-bold text-white leading-relaxed">
                "{item.question}"
              </div>
              <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400">Suggested Partner Delivery: </span>
                {item.suggested_answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
