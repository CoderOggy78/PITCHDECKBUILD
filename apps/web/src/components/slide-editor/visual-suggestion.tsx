"use client";

import {
  Layers,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  Shield,
  CheckCircle,
  Users,
  DollarSign
} from "lucide-react";

interface VisualSuggestionProps {
  visualType?: string;
  visualData?: any;
  recommendation?: string;
}

export function VisualSuggestion({ visualType, visualData, recommendation }: VisualSuggestionProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-brand-cyan">
          <Layers className="h-3.5 w-3.5" />
          SUGGESTED VISUAL ARCHITECTURE
        </span>
        <span className="text-[10px] text-slate-500 uppercase">{visualType || "Custom Layout"}</span>
      </div>

      <p className="text-xs text-slate-300 italic">{recommendation}</p>

      {/* Render Dynamic Visual Schematics */}
      {visualType === "bottleneck_funnel" && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          {["Siloed Telemetry", "Manual Triage Delay", "Catastrophic Breakdown", "Regulatory Fine"].map(
            (stage, i) => (
              <div
                key={stage}
                className="rounded-lg bg-white/5 border border-red-500/20 p-2.5 text-center flex flex-col justify-between"
              >
                <span className="text-[10px] text-slate-500 font-mono">STAGE 0{i + 1}</span>
                <span className="text-xs font-bold text-white mt-1">{stage}</span>
                <span className="text-[10px] text-red-400 font-medium mt-2">
                  {i === 0 && "$1,500/day"}
                  {i === 1 && "$25k delay"}
                  {i === 2 && "$450k+ outage"}
                  {i === 3 && "$1.2M liability"}
                </span>
              </div>
            )
          )}
        </div>
      )}

      {visualType === "architecture_pillars" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {[
            { title: "1. Ingest", desc: "Sensors, SCADA, Satellite", color: "border-blue-500/30" },
            { title: "2. Predict", desc: "Physics Anomaly AI", color: "border-brand-violet/40" },
            { title: "3. Automate", desc: "Instant Remediation Dispatch", color: "border-brand-cyan/30" },
          ].map((pillar) => (
            <div key={pillar.title} className={`rounded-lg bg-white/5 border ${pillar.color} p-3 text-center`}>
              <div className="text-xs font-bold text-white">{pillar.title}</div>
              <div className="text-[11px] text-slate-400 mt-1">{pillar.desc}</div>
            </div>
          ))}
        </div>
      )}

      {visualType === "concentric_market" && (
        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
          <div className="rounded-lg bg-brand-violet/10 border border-brand-violet/30 p-3">
            <div className="text-[10px] text-brand-accent font-mono">TAM</div>
            <div className="text-sm font-bold text-white mt-0.5">$14.4B</div>
            <div className="text-[10px] text-slate-400">300k Global Orgs</div>
          </div>
          <div className="rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 p-3">
            <div className="text-[10px] text-brand-cyan font-mono">SAM</div>
            <div className="text-sm font-bold text-white mt-0.5">$2.88B</div>
            <div className="text-[10px] text-slate-400">60k Reachable Orgs</div>
          </div>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
            <div className="text-[10px] text-emerald-400 font-mono">SOM (36 Mo)</div>
            <div className="text-sm font-bold text-white mt-0.5">$100.8M</div>
            <div className="text-[10px] text-slate-400">2,100 Capture Accounts</div>
          </div>
        </div>
      )}

      {visualType === "quadrant_2x2" && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-xs text-slate-400">
            <span className="text-[10px] font-mono text-slate-500">CUSTOM CONSULTING</span>
            <div className="font-semibold text-slate-300 mt-1">Deep AI, Slow Non-Scalable</div>
          </div>
          <div className="rounded-lg bg-brand-violet/20 border border-brand-violet/50 p-2.5 text-xs">
            <span className="text-[10px] font-mono text-brand-accent font-bold">OUR POSITION</span>
            <div className="font-bold text-white mt-1">Autonomous 14-Day Prediction + Fast Cloud Setup</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-xs text-slate-400">
            <span className="text-[10px] font-mono text-slate-500">LEGACY SCADA</span>
            <div className="font-semibold text-slate-300 mt-1">Hardware Lock-In, Purely Reactive</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-xs text-slate-400">
            <span className="text-[10px] font-mono text-slate-500">GENERIC DASHBOARDS</span>
            <div className="font-semibold text-slate-300 mt-1">Fast Setup, No Domain Physics</div>
          </div>
        </div>
      )}

      {visualType === "gtm_roadmap" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          {[
            { phase: "Months 0-6", target: "15 Direct Flagship Pilots", rev: "$360k ARR" },
            { phase: "Months 6-18", target: "Civil Engineering Resellers", rev: "$1.8M ARR" },
            { phase: "Months 18-36", target: "OEM Bundling & Multi-Region", rev: "$6.5M ARR" },
          ].map((p) => (
            <div key={p.phase} className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-center">
              <span className="text-[10px] text-brand-cyan font-mono">{p.phase}</span>
              <div className="text-xs font-semibold text-white mt-1">{p.target}</div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">{p.rev}</div>
            </div>
          ))}
        </div>
      )}

      {visualType === "use_of_funds_donut" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center">
          <div className="rounded-lg bg-brand-violet/20 border border-brand-violet/40 p-2">
            <div className="text-sm font-bold text-white">45%</div>
            <div className="text-[10px] text-slate-300">Engineering & ML</div>
          </div>
          <div className="rounded-lg bg-brand-cyan/20 border border-brand-cyan/40 p-2">
            <div className="text-sm font-bold text-white">30%</div>
            <div className="text-[10px] text-slate-300">Enterprise GTM</div>
          </div>
          <div className="rounded-lg bg-purple-500/20 border border-purple-500/40 p-2">
            <div className="text-sm font-bold text-white">15%</div>
            <div className="text-[10px] text-slate-300">Cloud & Security</div>
          </div>
          <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 p-2">
            <div className="text-sm font-bold text-white">10%</div>
            <div className="text-[10px] text-slate-300">Working Capital</div>
          </div>
        </div>
      )}
    </div>
  );
}
