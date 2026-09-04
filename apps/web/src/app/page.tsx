"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  FileCheck,
  Cpu,
  BarChart3,
  ShieldCheck,
  Search,
  Layers,
  Database,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText,
  Brain,
  Sliders,
  Compass,
  Edit3
} from "lucide-react";

export default function HomePage() {
  const [pipelineStage, setPipelineStage] = useState(0);

  const pipelineStages = [
    "Synthesizing startup concept and customer pain funnel...",
    "Embedding reference pitch patterns with dense semantic vectors...",
    "Calculating bottom-up TAM, SAM, and SOM unit formulas...",
    "Positioning 2x2 competitive quadrant against market incumbents...",
    "Engineering 10 structured, evidence-grounded pitch slides...",
    "Executing deterministic 5-year cash burn & runway model...",
    "Running 10-dimension Investor Red Team partner audit...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPipelineStage((prev) => (prev + 1) % pipelineStages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [pipelineStages.length]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION — VOYLEARNING AESTHETIC */}
      <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
        {/* Starfield Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Founders working under the starry cosmos"
            fill
            priority
            className="object-cover object-center opacity-100 scale-105 transition-transform duration-1000"
          />
          {/* Vignette blending into deep dark canvas */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/30 to-[#07090E]/70 hero-vignette" />
          <div className="absolute inset-0 starfield-overlay opacity-30 pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-6 pt-8 pb-16">
          <h1 className="font-serif-hero text-5xl sm:text-7xl md:text-8xl lg:text-[5.75rem] font-normal tracking-tight text-white hero-heading leading-[1.08] drop-shadow-2xl">
            Where ideas <span className="italic font-normal hero-title-italic drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">rise</span> through{" "}
            <br className="hidden sm:inline" />
            grounded intelligence.
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg hero-paragraph leading-relaxed tracking-wide px-4">
            We built an intelligent workspace for visionary founders and venture studios. Ingest your concept,
            ground assumptions in institutional patterns, and engineer an investable 10-slide blueprint — all in one place.
          </p>

          <div className="pt-6">
            <Link
              href="/wizard"
              className="glass-pill inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Begin Journey
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[10px] font-mono text-slate-400 uppercase tracking-widest flex flex-col items-center gap-1.5 pointer-events-none">
          <span>Explore Platform</span>
          <div className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ACTIVE INTELLIGENCE PIPELINE TICKER */}
      <section className="relative z-20 border-y border-white/10 bg-[#07090E]/90 backdrop-blur-xl py-5 px-6 pipeline-ticker">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-brand-accent uppercase tracking-wider font-semibold">Active Engine:</span>
            <span className="text-slate-200 truncate">{pipelineStages[pipelineStage]}</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-[11px]">
            <span>Deterministic Formulas</span>
            <span className="hidden md:inline">•</span>
            <span>pgvector Retrieval</span>
            <span className="hidden md:inline">•</span>
            <span className="text-emerald-400">Zero Hallucinations</span>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE VENTUREFORGE — EXACT VOYLEARNING THEME SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Section Heading with subtle accent underline */}
        <div className="space-y-3">
          <h2 className="font-serif-hero text-4xl sm:text-6xl font-normal text-white tracking-tight">
            What's inside <br />
            <span className="text-slate-400 font-serif">VentureForge.</span>
          </h2>
          <div className="w-10 h-0.5 bg-white/40" />
        </div>

        {/* 3-Card Grid Matching VoyLearning Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 01: Ingest & Ground */}
          <div className="glass-panel rounded-3xl p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all bg-[#0B0E17]/90">
            <div className="space-y-4">
              {/* Top Row: Icon + Large Index Number */}
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-serif text-3xl sm:text-4xl text-slate-500 font-light select-none">
                  01
                </span>
              </div>

              {/* Tag + Title + Description */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  INGEST &amp; RAG
                </span>
                <h3 className="font-serif-hero text-2xl text-white font-normal mt-1">
                  Reference intelligence.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light leading-relaxed">
                  Upload competitor and benchmark pitch decks. The engine parses pages, classifies structures across 16 categories, and grounds slide recommendations in cited evidence.
                </p>
              </div>

              {/* Embedded Visual 3D Graphic */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/5 mt-4">
                <Image
                  src="/feature-book.jpg"
                  alt="Reference pitch intelligence glass book"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Card 02: AI Blueprint Engine */}
          <div className="glass-panel rounded-3xl p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all bg-[#0B0E17]/90">
            <div className="space-y-4">
              {/* Top Row: Icon + Large Index Number */}
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="font-serif text-3xl sm:text-4xl text-slate-500 font-light select-none">
                  02
                </span>
              </div>

              {/* Tag + Title + Description */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  ARCHITECT
                </span>
                <h3 className="font-serif-hero text-2xl text-white font-normal mt-1">
                  AI as your co-founder.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light leading-relaxed">
                  Live 3-pane workbench with inline-editable canvas, visual diagram archetypes, and AI Copilot to sharpen positioning, challenge assumptions, and generate partner-ready slides.
                </p>
              </div>

              {/* Embedded Visual 3D Graphic */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/5 mt-4">
                <Image
                  src="/feature-tablet.jpg"
                  alt="AI copilot intelligence tablet"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* Card 03: Financials & Red Team */}
          <div className="glass-panel rounded-3xl p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all bg-[#0B0E17]/90">
            <div className="space-y-4">
              {/* Top Row: Icon + Large Index Number */}
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="font-serif text-3xl sm:text-4xl text-slate-500 font-light select-none">
                  03
                </span>
              </div>

              {/* Tag + Title + Description */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  VALIDATE
                </span>
                <h3 className="font-serif-hero text-2xl text-white font-normal mt-1">
                  Deterministic models.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light leading-relaxed">
                  Formula-backed bottom-up TAM/SAM/SOM calculators, 5-year financial models, and a 10-dimension partner Red Team audit that identifies inconsistencies before investors do.
                </p>
              </div>

              {/* Embedded Visual 3D Graphic */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/5 mt-4">
                <Image
                  src="/feature-nodes.jpg"
                  alt="Deterministic financial data nodes"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Box */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/15 bg-gradient-to-r from-brand-violet/10 via-[#0B0E17] to-brand-cyan/10 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left mt-8">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              INSTANT BLUEPRINT
            </span>
            <h3 className="font-serif-hero text-3xl sm:text-4xl text-white font-normal">
              Transform Your Raw Idea Into an Investor Blueprint
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed font-light">
              Enter your concept, audience, and economics. VentureForge engineers a complete, fully editable 10-slide blueprint with interactive models and exportable PowerPoint presentation.
            </p>
          </div>

          <Link
            href="/wizard"
            className="glass-pill px-8 py-3.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-glow-violet transition-all hover:scale-105 active:scale-95"
          >
            Launch Intake Wizard
          </Link>
        </div>
      </section>
    </div>
  );
}
