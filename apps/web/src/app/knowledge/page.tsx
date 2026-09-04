"use client";

import { useEffect, useState } from "react";
import { fetchKnowledgeAnalytics } from "@/lib/api";
import {
  Database,
  Layers,
  FileCheck,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
  Lightbulb,
  Cpu,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";

export default function KnowledgePage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchKnowledgeAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#06080D]">
        <span className="text-xs font-mono text-slate-400">Loading Venture Knowledge Base...</span>
      </div>
    );
  }

  const categoryChartData = (data?.category_distribution || []).map((item: any) => ({
    name: item.category,
    count: item.count,
    percentage: item.percentage,
  }));

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
      <div className="border-b border-white/10 pb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">
          Venture Knowledge Base
        </span>
        <h1 className="font-serif-hero text-4xl sm:text-5xl font-normal text-white mt-1">
          Collective Pitch Pattern Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light">
          Aggregated analytics, structure frequencies, and benchmark insights learned across indexed pitch decks.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="text-xs font-mono text-slate-400 uppercase">Decks Indexed</div>
          <div className="font-serif-hero text-4xl text-white mt-2">
            {data?.total_decks_indexed || 12}
          </div>
          <div className="text-[11px] text-brand-cyan mt-1 font-light">Venture-scale reference files</div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="text-xs font-mono text-slate-400 uppercase">Slides Analyzed</div>
          <div className="font-serif-hero text-4xl text-brand-violet mt-2">
            {data?.total_slides_analyzed || 148}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-light">
            Avg {data?.avg_deck_length || 12.3} slides/deck
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="text-xs font-mono text-slate-400 uppercase">Index Coverage</div>
          <div className="font-serif-hero text-4xl text-emerald-400 mt-2">
            {data?.index_coverage_pct || 96.5}%
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 font-light">pgvector similarity ready</div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="text-xs font-mono text-slate-400 uppercase">Slide Categories</div>
          <div className="font-serif-hero text-4xl text-slate-200 mt-2">16</div>
          <div className="text-[11px] text-slate-400 mt-1 font-light">Standardized venture taxonomies</div>
        </div>
      </div>

      {/* Slide Category Distribution Chart */}
      <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4">
        <div>
          <h3 className="font-serif-hero text-2xl text-white">
            Reference Slide Category Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-light">
            Frequency of core pitch modules across all indexed venture decks.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D121E",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative Sequences & Key Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Most Common Narrative Sequence */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4">
          <h3 className="font-serif-hero text-2xl text-white">
            Standard Top-Tier Pitch Narrative Sequence
          </h3>

          <div className="space-y-2">
            {(data?.common_narrative_flow || []).map((step: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200 font-mono"
              >
                <span className="flex h-5 w-5 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-bold items-center justify-center">
                  {i + 1}
                </span>
                <span>{step.replace(/^\d+\.\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Industry Insights & Benchmarks */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4 bg-gradient-to-br from-brand-cyan/5 to-transparent">
            <h3 className="font-serif-hero text-2xl text-brand-cyan">
              Venture Intelligence Insights
            </h3>

            <div className="space-y-3">
              {(data?.industry_insights || []).map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed font-light">
                  <CheckCircle2 className="h-4 w-4 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-3">
            <h3 className="font-serif-hero text-2xl text-white">
              Core Venture Benchmarks
            </h3>

            <div className="space-y-2 font-mono text-xs text-slate-300">
              {(data?.key_benchmarks || []).map((bm: string, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  {bm}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
