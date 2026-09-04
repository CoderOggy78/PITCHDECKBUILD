"use client";

import { useState } from "react";
import { PitchSlide, MetricItem } from "@/lib/types";
import { VisualSuggestion } from "./visual-suggestion";
import {
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  FileCheck,
  HelpCircle,
  AlertCircle,
  Quote,
  Check,
  ExternalLink,
  MessageSquare
} from "lucide-react";

interface SlideCanvasProps {
  slide: PitchSlide;
  onUpdateSlide: (updated: Partial<PitchSlide>) => void;
  onRegenerateSlide: () => void;
  isSaving: boolean;
}

export function SlideCanvas({
  slide,
  onUpdateSlide,
  onRegenerateSlide,
  isSaving,
}: SlideCanvasProps) {
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSlide({ headline: e.target.value });
  };

  const handleNarrativeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateSlide({ narrative: e.target.value });
  };

  const handleKeyPointChange = (index: number, val: string) => {
    const updated = [...(slide.key_points || [])];
    updated[index] = val;
    onUpdateSlide({ key_points: updated });
  };

  const addKeyPoint = () => {
    const updated = [...(slide.key_points || []), "New strategic point for this slide..."];
    onUpdateSlide({ key_points: updated });
  };

  const removeKeyPoint = (index: number) => {
    const updated = (slide.key_points || []).filter((_, i) => i !== index);
    onUpdateSlide({ key_points: updated });
  };

  const getBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case "Founder Provided":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Reference Pattern":
        return "bg-brand-violet/10 text-brand-accent border-brand-violet/20";
      case "Confirmed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Needs Validation":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Top Slide Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-brand-cyan">
            <span>SLIDE {String(slide.slide_number).padStart(2, "0")}</span>
            <span>•</span>
            <span>{slide.title}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{slide.objective}</div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">
            {isSaving ? "Autosaving..." : "Saved to project"}
          </span>

          <button
            onClick={onRegenerateSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-brand-violet" />
            Regenerate Slide
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
        {/* Headline (Direct Inline Editable) */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1">
            Slide Headline
          </label>
          <input
            type="text"
            value={slide.headline || ""}
            onChange={handleHeadlineChange}
            placeholder="Action-oriented investor headline..."
            className="w-full text-xl sm:text-2xl font-bold text-white bg-transparent border-b border-white/10 focus:border-brand-violet focus:outline-none pb-2 transition-colors"
          />
        </div>

        {/* Narrative Paragraph */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1">
            Core Narrative
          </label>
          <textarea
            rows={3}
            value={slide.narrative || ""}
            onChange={handleNarrativeChange}
            placeholder="Core thesis and market justification..."
            className="w-full text-sm text-slate-300 bg-black/30 border border-white/10 rounded-xl p-3.5 focus:border-brand-violet focus:outline-none leading-relaxed"
          />
        </div>

        {/* Strategic Takeaways / Bullet Points */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Strategic Key Points (3-5 Pillars)
            </label>
            <button
              onClick={addKeyPoint}
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Pillar
            </button>
          </div>

          <div className="space-y-2">
            {(slide.key_points || []).map((point, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <span className="text-xs font-mono text-brand-violet mt-2.5">•</span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleKeyPointChange(i, e.target.value)}
                  className="flex-1 text-xs text-slate-200 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 focus:border-brand-violet focus:outline-none"
                />
                <button
                  onClick={() => removeKeyPoint(i)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1.5 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Key Quantitative Metrics with Claim Confidence Badges */}
        {slide.metrics && slide.metrics.length > 0 && (
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2">
              Key Quantitative Metrics & Evidence
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {slide.metrics.map((metric: MetricItem, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl bg-black/40 border border-white/10 p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{metric.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${getBadgeColor(
                        metric.source_type
                      )}`}
                    >
                      {metric.source_type}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5">{metric.value}</div>
                  {metric.detail && (
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{metric.detail}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Visual Architecture */}
        <VisualSuggestion
          visualType={slide.visual_type}
          visualData={slide.visual_data}
          recommendation={slide.visual_recommendation}
        />

        {/* Missing Information / Founder Action Required */}
        {slide.missing_information && slide.missing_information.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Founder Verification & Required Data
            </div>
            {slide.missing_information.map((item, i) => (
              <p key={i} className="text-xs text-slate-300 pl-6 leading-relaxed">
                {item}
              </p>
            ))}
          </div>
        )}

        {/* Grounded Reference Citations */}
        {slide.citations && slide.citations.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 mb-2">
              <FileCheck className="h-3.5 w-3.5 text-brand-violet" />
              Grounded Reference Pattern Citations
            </div>
            <div className="flex flex-wrap gap-2">
              {slide.citations.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCitation(c)}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand-violet/50 hover:bg-white/10 text-slate-300 transition-all text-left"
                >
                  <span className="font-semibold text-brand-accent">{c.document_name}</span>
                  <span className="text-slate-500">Page {c.page_number}</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Investor Question Answered & Speaker Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan mb-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Investor Question Answered
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{slide.investor_question || 'How defensible is your initial customer wedge?'}"
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Speaker Notes / Partner Delivery
            </div>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {slide.speaker_notes || "Deliver with conviction: emphasize the clear unit arithmetic."}
            </p>
          </div>
        </div>
      </div>

      {/* Citation Preview Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileCheck className="h-4 w-4 text-brand-violet" />
                {selectedCitation.document_name}
              </div>
              <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                Page {selectedCitation.page_number}
              </span>
            </div>

            <div className="bg-black/50 rounded-xl p-4 border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">
                Extracted Reference Text Snippet
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{selectedCitation.snippet}"
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
