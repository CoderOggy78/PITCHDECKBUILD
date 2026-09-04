"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  fetchPitchDeck,
  updateSlide,
  regenerateSlide,
  fetchFinancialModel,
  fetchCompetitors,
  runInvestorRedTeam,
  runConsistencyCheck,
} from "@/lib/api";
import {
  PitchDeck,
  PitchSlide,
  FinancialModelData,
  Competitor,
  RedTeamResponse,
} from "@/lib/types";
import { SlideNav } from "@/components/slide-editor/slide-nav";
import { SlideCanvas } from "@/components/slide-editor/slide-canvas";
import { CopilotSidebar } from "@/components/slide-editor/copilot-sidebar";
import { FinancialCalculator } from "@/components/financial-model/financial-calculator";
import { MarketSizeCalculator } from "@/components/financial-model/market-size-calculator";
import { CompetitorMatrix } from "@/components/financial-model/competitor-matrix";
import { CritiqueView } from "@/components/red-team/critique-view";
import { ConsistencyView } from "@/components/red-team/consistency-view";
import {
  Sparkles,
  Download,
  Layers,
  BarChart3,
  ShieldCheck,
  FileText,
  FileCode,
  CheckCircle2,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"editor" | "financials" | "red_team" | "export">("editor");

  // Analytics & Models
  const [financialData, setFinancialData] = useState<FinancialModelData | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [redTeamReport, setRedTeamReport] = useState<RedTeamResponse | null>(null);
  const [consistencyData, setConsistencyData] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRerunningRedTeam, setIsRerunningRedTeam] = useState(false);

  useEffect(() => {
    async function loadProjectData() {
      try {
        const [deckRes, finRes, compRes, redRes, conRes] = await Promise.all([
          fetchPitchDeck(projectId),
          fetchFinancialModel(projectId),
          fetchCompetitors(projectId),
          runInvestorRedTeam(projectId),
          runConsistencyCheck(projectId),
        ]);
        setDeck(deckRes);
        setFinancialData(finRes);
        setCompetitors(compRes);
        setRedTeamReport(redRes);
        setConsistencyData(conRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjectData();
  }, [projectId]);

  const handleUpdateSlide = async (updated: Partial<PitchSlide>) => {
    if (!deck || !deck.slides[activeSlideIndex]) return;
    const currentSlide = deck.slides[activeSlideIndex];
    setIsSaving(true);

    try {
      const saved = await updateSlide(currentSlide.id, updated);
      const newSlides = [...deck.slides];
      newSlides[activeSlideIndex] = saved;
      setDeck({ ...deck, slides: newSlides });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSlide = async () => {
    if (!deck || !deck.slides[activeSlideIndex]) return;
    const currentSlide = deck.slides[activeSlideIndex];
    setIsSaving(true);

    try {
      const regenerated = await regenerateSlide(currentSlide.id);
      const newSlides = [...deck.slides];
      newSlides[activeSlideIndex] = regenerated;
      setDeck({ ...deck, slides: newSlides });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRerunRedTeam = async () => {
    setIsRerunningRedTeam(true);
    try {
      const [newRed, newCon] = await Promise.all([
        runInvestorRedTeam(projectId),
        runConsistencyCheck(projectId),
      ]);
      setRedTeamReport(newRed);
      setConsistencyData(newCon);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRerunningRedTeam(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#06080D]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-xs font-mono text-slate-400">Loading Venture Intelligence Workspace...</span>
        </div>
      </div>
    );
  }

  if (!deck || !deck.slides || deck.slides.length === 0) {
    return (
      <div className="p-8 text-center pt-28">
        <h2 className="font-serif-hero text-3xl text-white">No pitch deck found</h2>
        <Link href="/dashboard" className="mt-4 inline-block text-brand-cyan underline text-xs font-mono">
          Return to Studio
        </Link>
      </div>
    );
  }

  const activeSlide = deck.slides[activeSlideIndex];

  return (
    <div className="relative flex flex-col h-screen overflow-hidden pt-20">
      {/* Nature Landscape Painting Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/nature-bg.jpg"
          alt="Impressionist autumn nature meadow"
          fill
          priority
          className="object-cover object-center opacity-70 scale-105"
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/75 backdrop-blur-[2px]" />
      </div>

      {/* Sub-Header Navigation */}
      <div className="relative z-10 flex items-center justify-between px-8 py-3 bg-[#06080D]/90 dark:bg-[#06080D]/90 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Studio
          </Link>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <h2 className="font-serif-hero text-xl text-white truncate max-w-xs">{deck.title}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
              v{deck.version}.0
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "editor"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            10-Slide Editor
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "financials"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Financials &amp; Market
          </button>

          <button
            onClick={() => setActiveTab("red_team")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "red_team"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Red Team &amp; Integrity
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "export"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Exports
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === "editor" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: 10-Slide Navigation Tree */}
          <SlideNav
            slides={deck.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={setActiveSlideIndex}
          />

          {/* Center: Slide Editor Canvas */}
          <SlideCanvas
            slide={activeSlide}
            onUpdateSlide={handleUpdateSlide}
            onRegenerateSlide={handleRegenerateSlide}
            isSaving={isSaving}
          />

          {/* Right: AI Copilot Sidebar */}
          <CopilotSidebar
            slideId={activeSlide.id}
            slideTitle={activeSlide.title}
          />
        </div>
      )}

      {activeTab === "financials" && (
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 max-w-7xl mx-auto w-full">
          {financialData && (
            <FinancialCalculator projectId={projectId} initialData={financialData} />
          )}

          {financialData && (
            <MarketSizeCalculator initialSizing={financialData.market_sizing} />
          )}

          <CompetitorMatrix projectId={projectId} initialCompetitors={competitors} />
        </div>
      )}

      {activeTab === "red_team" && (
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 max-w-6xl mx-auto w-full">
          {redTeamReport && (
            <CritiqueView
              report={redTeamReport}
              onRerun={handleRerunRedTeam}
              isRerunning={isRerunningRedTeam}
            />
          )}

          {consistencyData && (
            <ConsistencyView
              consistencyScore={consistencyData.consistency_score}
              issues={consistencyData.issues}
              onRerun={handleRerunRedTeam}
              isRerunning={isRerunningRedTeam}
            />
          )}
        </div>
      )}

      {activeTab === "export" && (
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">Institutional Deliverables</span>
            <h2 className="font-serif-hero text-3xl sm:text-4xl text-white font-normal mt-1">Export Pitch Blueprint</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
              Download your complete investor materials in industry-standard presentation, PDF, markdown, and structured data formats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PPTX Dark Theme */}
            <a
              href={`http://127.0.0.1:8000/api/export/${projectId}/pptx?theme=dark`}
              className="glass-panel-interactive rounded-2xl p-7 border border-white/10 flex flex-col justify-between block"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-brand-accent mb-3">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="font-serif-hero text-2xl text-white">PowerPoint (Dark Theme)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">
                  16:9 widescreen presentation in Midnight Obsidian with metric cards and category badges.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-brand-cyan flex items-center gap-1">
                Download Dark .pptx
              </div>
            </a>

            {/* PPTX Light Theme */}
            <a
              href={`http://127.0.0.1:8000/api/export/${projectId}/pptx?theme=light`}
              className="glass-panel-interactive rounded-2xl p-7 border border-white/10 flex flex-col justify-between block"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                  <Download className="h-5 w-5" />
                </div>
                <h3 className="font-serif-hero text-2xl text-white">PowerPoint (Light Theme)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">
                  16:9 widescreen presentation on clean white paper with charcoal text and high contrast.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-sky-400 flex items-center gap-1">
                Download Light .pptx
              </div>
            </a>

            {/* Printable PDF Summary */}
            <a
              href={`http://127.0.0.1:8000/api/export/${projectId}/pdf`}
              className="glass-panel-interactive rounded-2xl p-7 border border-white/10 flex flex-col justify-between block"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-serif-hero text-2xl text-white">Executive Memo PDF (.pdf)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">
                  Print-ready 10-slide outline memo for investor partner meetings and committee review packs.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-brand-cyan flex items-center gap-1">
                Download PDF Memo
              </div>
            </a>

            {/* Markdown Outline */}
            <a
              href={`http://127.0.0.1:8000/api/export/${projectId}/markdown`}
              className="glass-panel-interactive rounded-2xl p-7 border border-white/10 flex flex-col justify-between block"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <FileCode className="h-5 w-5" />
                </div>
                <h3 className="font-serif-hero text-2xl text-white">Markdown Blueprint (.md)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">
                  Clean GitHub-formatted markdown containing all narrative points, speaker notes, and cited sources.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-brand-cyan flex items-center gap-1">
                Download Markdown
              </div>
            </a>

            {/* JSON Data Schema */}
            <a
              href={`http://127.0.0.1:8000/api/export/${projectId}/json`}
              target="_blank"
              className="glass-panel-interactive rounded-2xl p-7 border border-white/10 flex flex-col justify-between block"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <FileCode className="h-5 w-5" />
                </div>
                <h3 className="font-serif-hero text-2xl text-white">Structured JSON Schema (.json)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">
                  Complete machine-readable JSON object including slides, claims, citations, and 5-year financial numbers.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-brand-cyan flex items-center gap-1">
                View Raw JSON
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
