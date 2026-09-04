"use client";

import { PitchSlide } from "@/lib/types";
import {
  AlertTriangle,
  Lightbulb,
  PieChart,
  DollarSign,
  Compass,
  Rocket,
  Users,
  BarChart2,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";

interface SlideNavProps {
  slides: PitchSlide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

export function SlideNav({ slides, activeSlideIndex, onSelectSlide }: SlideNavProps) {
  const getSlideIcon = (slideType: string) => {
    switch (slideType) {
      case "problem": return AlertTriangle;
      case "solution": return Lightbulb;
      case "market": return PieChart;
      case "business_model": return DollarSign;
      case "competition": return Compass;
      case "gtm": return Rocket;
      case "team": return Users;
      case "financials": return BarChart2;
      case "traction": return TrendingUp;
      case "funding": return Target;
      default: return Lightbulb;
    }
  };

  const avgCompleteness = slides.length > 0
    ? Math.round(slides.reduce((acc, s) => acc + (s.completeness_score || 80), 0) / slides.length)
    : 80;

  return (
    <div className="flex flex-col h-full bg-black/40 border-r border-white/10 w-72 flex-shrink-0">
      {/* Deck Summary Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">
          <span>Blueprint Structure</span>
          <span className="text-emerald-400 font-bold">{avgCompleteness}% Ready</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-violet to-brand-cyan h-full rounded-full transition-all duration-500"
            style={{ width: `${avgCompleteness}%` }}
          />
        </div>
      </div>

      {/* 10-Slide Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {slides.map((slide, idx) => {
          const Icon = getSlideIcon(slide.slide_type);
          const isActive = idx === activeSlideIndex;
          const completeness = Math.round(slide.completeness_score || 80);

          return (
            <button
              key={slide.id || idx}
              onClick={() => onSelectSlide(idx)}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                isActive
                  ? "bg-brand-violet/20 border border-brand-violet/50 text-white shadow-glow-violet"
                  : "bg-white/[0.02] border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-brand-violet text-white"
                      : "bg-white/5 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono text-slate-400">
                    {String(slide.slide_number).padStart(2, "0")}
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-200">
                    {slide.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-[10px] font-mono font-medium ${
                    completeness >= 85
                      ? "text-emerald-400"
                      : completeness >= 70
                      ? "text-amber-400"
                      : "text-slate-400"
                  }`}
                >
                  {completeness}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
