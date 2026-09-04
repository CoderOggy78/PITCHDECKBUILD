"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Scissors,
  HelpCircle,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Send,
  Loader2,
  BarChart2,
  Cpu
} from "lucide-react";
import { runCopilotAction } from "@/lib/api";

interface CopilotSidebarProps {
  slideId: string;
  slideTitle: string;
}

export function CopilotSidebar({ slideId, slideTitle }: CopilotSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [response, setResponse] = useState<{
    action: string;
    suggestion: string;
    reasoning: string;
    citations: any[];
  } | null>(null);

  const actions = [
    { id: "improve", label: "Improve Slide", icon: Sparkles },
    { id: "investor_friendly", label: "Make Investor-Friendly", icon: TrendingUp },
    { id: "shorten", label: "Shorten (<60 words)", icon: Scissors },
    { id: "add_metrics", label: "Add Unit Metrics", icon: BarChart2 },
    { id: "challenge_assumptions", label: "Challenge Assumptions", icon: AlertTriangle },
    { id: "find_weak_claims", label: "Find Weak Claims", icon: FileSearch },
    { id: "reference_decks", label: "Use Reference Decks", icon: Cpu },
    { id: "rewrite_headline", label: "Rewrite Headline", icon: Lightbulb },
    { id: "visual_idea", label: "Generate Visual Layout", icon: Sparkles },
    { id: "vc_question", label: "What Would a VC Ask?", icon: HelpCircle },
  ];

  const handleExecute = async (actionId: string, customInstruction?: string) => {
    if (!slideId) return;
    setLoading(true);
    setActiveAction(actionId);

    try {
      const res = await runCopilotAction(slideId, actionId, customInstruction);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border-l border-white/10 w-80 lg:w-96 flex-shrink-0">
      {/* Copilot Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-brand-accent">
          <Sparkles className="h-4 w-4 text-brand-violet" />
          <span>Venture Copilot</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Active target: <span className="text-white font-semibold">{slideTitle}</span>
        </div>
      </div>

      {/* Action Chips Grid */}
      <div className="p-4 border-b border-white/10 space-y-2">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          One-Click Copilot Actions
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            const isCurrent = activeAction === act.id && loading;
            return (
              <button
                key={act.id}
                onClick={() => handleExecute(act.id)}
                disabled={loading}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.03] hover:bg-brand-violet/20 border border-white/5 hover:border-brand-violet/30 text-left text-[11px] text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                {isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-accent flex-shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-brand-violet flex-shrink-0" />
                )}
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Copilot Output Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Loader2 className="h-6 w-6 text-brand-cyan animate-spin mb-2" />
            <span className="text-xs text-slate-400 font-mono">Synthesizing venture intelligence...</span>
          </div>
        ) : response ? (
          <div className="glass-panel rounded-xl p-4 border border-brand-violet/30 space-y-3 bg-brand-violet/[0.04]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono text-brand-accent uppercase font-semibold">
                AI Suggestion • {response.action.replace("_", " ")}
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>

            <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {response.suggestion}
            </div>

            {response.reasoning && (
              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 italic">
                <span className="font-semibold text-slate-300">VC Rationale: </span>
                {response.reasoning}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 py-8 px-4">
            <Sparkles className="h-6 w-6 text-slate-600 mx-auto mb-2" />
            Select an AI action above or ask a custom question to refine this slide.
          </div>
        )}
      </div>

      {/* Custom Prompt Input */}
      <div className="p-3 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customPrompt.trim()) {
              handleExecute("custom", customPrompt);
              setCustomPrompt("");
            }
          }}
          className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-xl p-1.5 focus-within:border-brand-violet"
        >
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask Copilot: e.g. Add 3 B2B case studies..."
            className="flex-1 bg-transparent px-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !customPrompt.trim()}
            className="p-1.5 rounded-lg bg-brand-violet text-white hover:brightness-110 disabled:opacity-40 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
