"use client";

import { useState, useEffect } from "react";
import { FinancialModelData } from "@/lib/types";
import { updateFinancialModel } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DollarSign, TrendingUp, Sliders, RefreshCw, Layers } from "lucide-react";

interface FinancialCalculatorProps {
  projectId: string;
  initialData: FinancialModelData;
}

export function FinancialCalculator({ projectId, initialData }: FinancialCalculatorProps) {
  const [data, setData] = useState<FinancialModelData>(initialData);
  const [assumptions, setAssumptions] = useState({
    starting_cash: initialData.starting_cash || 150000,
    monthly_burn: initialData.monthly_burn || 25000,
    funding_ask: initialData.funding_ask || 2000000,
    target_runway_months: initialData.target_runway_months || 24,
    acv: initialData.acv || 24000,
    gross_margin_pct: initialData.gross_margin_pct || 82,
    cac: initialData.cac || 4500,
    ltv: initialData.ltv || 72000,
    payback_months: initialData.payback_months || 6.5,
    y1_customers: 15,
    y2_customers: 45,
    y3_customers: 120,
    y4_customers: 280,
    y5_customers: 650,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleRecalculate = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateFinancialModel(projectId, assumptions);
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const chartData = (data.projections || []).map((p) => ({
    year: p.year,
    Revenue: p.revenue,
    GrossProfit: p.gross_profit,
    EBITDA: p.ebitda,
    CashEnding: p.cash_ending,
    Customers: p.customers,
  }));

  const fmt = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
    return `$${num}`;
  };

  return (
    <div className="space-y-8">
      {/* Top Unit Economics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Calculated Runway</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {data.calculated_runway_months} Months
          </div>
          <span className="text-[10px] text-slate-500">Based on ${assumptions.monthly_burn.toLocaleString()}/mo burn</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase">LTV : CAC Ratio</span>
          <div className="text-xl font-bold text-brand-cyan mt-1">{data.ltv_cac_ratio}x</div>
          <span className="text-[10px] text-slate-500">Target venture threshold &gt; 3.0x</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Gross Margin</span>
          <div className="text-xl font-bold text-white mt-1">{data.gross_margin_pct}%</div>
          <span className="text-[10px] text-slate-500">Cloud & telemetry optimized</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase">CAC Payback</span>
          <div className="text-xl font-bold text-brand-accent mt-1">{data.payback_months} Mo</div>
          <span className="text-[10px] text-slate-500">Upfront annual invoicing</span>
        </div>
      </div>

      {/* 5-Year Financial Forecast Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">5-Year Revenue, Gross Profit & EBITDA</h3>
            <p className="text-xs text-slate-400">
              Deterministic calculations based on customer ramp and ACV assumptions.
            </p>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-violet text-xs font-semibold text-white hover:brightness-110"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? "animate-spin" : ""}`} />
            Recalculate
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="year" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(val) => fmt(val)}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [fmt(Number(value)), ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="GrossProfit" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="EBITDA" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assumptions Interactive Inputs */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-brand-violet" />
          Model Assumptions & Unit Economics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">
              Annual Contract Value (ACV): ${assumptions.acv.toLocaleString()}
            </label>
            <input
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={assumptions.acv}
              onChange={(e) => setAssumptions({ ...assumptions, acv: Number(e.target.value) })}
              className="w-full accent-brand-violet cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">
              Gross Margin %: {assumptions.gross_margin_pct}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={assumptions.gross_margin_pct}
              onChange={(e) =>
                setAssumptions({ ...assumptions, gross_margin_pct: Number(e.target.value) })
              }
              className="w-full accent-brand-cyan cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">
              Customer Acquisition Cost (CAC): ${assumptions.cac.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={assumptions.cac}
              onChange={(e) => setAssumptions({ ...assumptions, cac: Number(e.target.value) })}
              className="w-full accent-brand-indigo cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">
              Monthly Burn Rate: ${assumptions.monthly_burn.toLocaleString()}
            </label>
            <input
              type="number"
              value={assumptions.monthly_burn}
              onChange={(e) =>
                setAssumptions({ ...assumptions, monthly_burn: Number(e.target.value) })
              }
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">
              Funding Ask: ${assumptions.funding_ask.toLocaleString()}
            </label>
            <input
              type="number"
              value={assumptions.funding_ask}
              onChange={(e) =>
                setAssumptions({ ...assumptions, funding_ask: Number(e.target.value) })
              }
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1">
              Year 5 Target Accounts
            </label>
            <input
              type="number"
              value={assumptions.y5_customers}
              onChange={(e) =>
                setAssumptions({ ...assumptions, y5_customers: Number(e.target.value) })
              }
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Fund Allocation Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Capital Deployment & Use of Funds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data.fund_allocation || []).map((alloc) => (
            <div key={alloc.category} className="rounded-xl bg-black/40 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{alloc.category}</span>
                <span className="text-xs font-mono text-brand-cyan font-bold">{alloc.percentage}%</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1.5">
                ${alloc.amount.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{alloc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
