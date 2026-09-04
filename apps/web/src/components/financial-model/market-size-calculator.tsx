"use client";

import { useState } from "react";
import { MarketSizing } from "@/lib/types";
import { PieChart, DollarSign, Calculator, HelpCircle, CheckCircle2 } from "lucide-react";

interface MarketSizeCalculatorProps {
  initialSizing: MarketSizing;
}

export function MarketSizeCalculator({ initialSizing }: MarketSizeCalculatorProps) {
  const [targetAccounts, setTargetAccounts] = useState(300000);
  const [annualSpend, setAnnualSpend] = useState(48000);
  const [reachablePct, setReachablePct] = useState(20);
  const [penetrationPct, setPenetrationPct] = useState(3.5);

  const tam = targetAccounts * annualSpend;
  const sam = tam * (reachablePct / 100);
  const som = sam * (penetrationPct / 100);

  const fmt = (num: number) => {
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Sizing Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-brand-violet/30 bg-brand-violet/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-brand-accent font-semibold">TAM</span>
            <span className="text-[10px] text-slate-500 font-mono">TOTAL ADDRESSABLE</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{fmt(tam)}</div>
          <div className="text-xs text-slate-400 mt-2 font-mono">{targetAccounts.toLocaleString()} Global Accounts × ${annualSpend.toLocaleString()}/yr</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-brand-cyan/30 bg-brand-cyan/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-brand-cyan font-semibold">SAM</span>
            <span className="text-[10px] text-slate-500 font-mono">SERVICEABLE SEGMENT</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{fmt(sam)}</div>
          <div className="text-xs text-slate-400 mt-2 font-mono">{reachablePct}% Qualified Wedge ({Math.round(targetAccounts * (reachablePct / 100)).toLocaleString()} Orgs)</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold">SOM (36 Mo)</span>
            <span className="text-[10px] text-slate-500 font-mono">OBTAINABLE SHARE</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{fmt(som)}</div>
          <div className="text-xs text-slate-400 mt-2 font-mono">{penetrationPct}% SAM Target ({Math.round((targetAccounts * (reachablePct / 100)) * (penetrationPct / 100)).toLocaleString()} Capturable)</div>
        </div>
      </div>

      {/* Interactive Bottom-Up Arithmetic Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calculator className="h-4 w-4 text-brand-cyan" />
          Bottom-Up Calculation Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
              <span>Total Qualified Target Accounts</span>
              <span className="text-brand-violet font-bold">{targetAccounts.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="1000000"
              step="5000"
              value={targetAccounts}
              onChange={(e) => setTargetAccounts(Number(e.target.value))}
              className="w-full accent-brand-violet cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
              <span>Average Annual Spend (ACV)</span>
              <span className="text-brand-cyan font-bold">${annualSpend.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="2500"
              value={annualSpend}
              onChange={(e) => setAnnualSpend(Number(e.target.value))}
              className="w-full accent-brand-cyan cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
              <span>Serviceable Reachable Segment (SAM %)</span>
              <span className="text-indigo-400 font-bold">{reachablePct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={reachablePct}
              onChange={(e) => setReachablePct(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
              <span>3-Year Obtainable Capture (SOM %)</span>
              <span className="text-emerald-400 font-bold">{penetrationPct}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={penetrationPct}
              onChange={(e) => setPenetrationPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">VC Grounding Rule: </span>
            Never present top-down macro estimates as facts. Sizing from account universe × ACV provides verifiable numbers during institutional investor diligence.
          </div>
        </div>
      </div>
    </div>
  );
}
