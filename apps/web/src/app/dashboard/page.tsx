"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { fetchProjects } from "@/lib/api";
import { ProjectSummary } from "@/lib/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-start py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Nature Landscape Painting Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/nature-bg.jpg"
          alt="Impressionist autumn nature meadow"
          fill
          priority
          className="object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-black/35 dark:bg-black/65 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">
            Venture Intelligence Studio
          </span>
          <h1 className="font-serif-hero text-4xl sm:text-5xl font-normal text-white mt-1">
            Your Venture Blueprints
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light">
            Architect, edit, and evaluate your structured 10-slide investor pitch blueprints.
          </p>
        </div>

        <Link
          href="/wizard"
          className="glass-pill px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white shadow-glow-violet transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          + New Blueprint
        </Link>
      </div>

      {/* Projects Grid / Empty State */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel rounded-3xl p-8 h-56 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 sm:p-16 text-center border border-white/10 max-w-2xl mx-auto space-y-5">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
              <Layers className="h-8 w-8 text-brand-cyan" />
            </div>
            <h3 className="font-serif-hero text-3xl text-white font-normal">
              No Ventures Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
              You haven't generated any pitch blueprints yet. Launch the intake wizard to enter your startup concept, target market, and reference decks.
            </p>
            <div className="pt-2">
              <Link
                href="/wizard"
                className="glass-pill inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white shadow-glow-violet transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Forge Your First Pitch Blueprint
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="glass-panel-interactive rounded-3xl p-8 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-serif-hero text-2xl sm:text-3xl text-white">{proj.name}</h3>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                          {proj.stage || "MVP"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-brand-cyan mt-1">{proj.industry || "AI / SaaS"}</p>
                    </div>

                    {/* Investor Readiness Badge */}
                    <div className="flex flex-col items-end">
                      <div className="font-serif-hero text-2xl font-normal text-white flex items-baseline gap-1">
                        <span className="text-emerald-400">{Math.round(proj.investor_readiness_score || 82)}</span>
                        <span className="text-xs text-slate-500 font-sans">/100</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Readiness</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed font-light">
                    {proj.one_liner || "Structured venture blueprint with deterministic financials."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      10 Slides Generated
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                      {proj.decks_indexed || 0} Decks Attached
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      Updated {new Date(proj.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/project/${proj.id}/red-team`}
                      className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 font-mono"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-violet" />
                      Red Team
                    </Link>

                    <a
                      href={`http://127.0.0.1:8000/api/export/${proj.id}/pptx`}
                      className="text-xs font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 font-mono"
                      title="Download 16:9 PPTX Presentation"
                    >
                      <Download className="h-3.5 w-3.5 text-brand-cyan" />
                      PPTX
                    </a>
                  </div>

                  <Link
                    href={`/project/${proj.id}`}
                    className="glass-pill px-5 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  >
                    Open Blueprint
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
