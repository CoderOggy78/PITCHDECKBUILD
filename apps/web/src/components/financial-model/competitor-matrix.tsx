"use client";

import { useState } from "react";
import { Competitor } from "@/lib/types";
import { addCompetitor, deleteCompetitor } from "@/lib/api";
import { Plus, Trash2, Shield, Compass, Sparkles } from "lucide-react";

interface CompetitorMatrixProps {
  projectId: string;
  initialCompetitors: Competitor[];
}

export function CompetitorMatrix({ projectId, initialCompetitors }: CompetitorMatrixProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComp, setNewComp] = useState<Partial<Competitor>>({
    name: "",
    category: "Direct",
    target_customer: "",
    pricing: "",
    strength: "",
    weakness: "",
    differentiator: "",
    our_advantage: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComp.name) return;

    try {
      const created = await addCompetitor(projectId, newComp);
      setCompetitors([...competitors, created]);
      setShowAddModal(false);
      setNewComp({
        name: "",
        category: "Direct",
        target_customer: "",
        pricing: "",
        strength: "",
        weakness: "",
        differentiator: "",
        our_advantage: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetitor(id);
      setCompetitors(competitors.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-brand-violet" />
            Competitive Positioning Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify direct, indirect, and status-quo competitors to defend your market wedge.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-violet hover:brightness-110 text-xs font-semibold text-white shadow-glow-violet transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Competitor
        </button>
      </div>

      {/* Comparison Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Competitor</th>
                <th className="p-4">Category</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">Key Strength</th>
                <th className="p-4">Critical Weakness</th>
                <th className="p-4">Our Defensible Edge</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {competitors.map((comp) => (
                <tr key={comp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">{comp.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-brand-cyan">
                      {comp.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{comp.pricing || "N/A"}</td>
                  <td className="p-4 text-slate-400">{comp.strength}</td>
                  <td className="p-4 text-red-400/80">{comp.weakness}</td>
                  <td className="p-4 text-emerald-400 font-medium">{comp.our_advantage}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-white/15 space-y-4">
            <h4 className="text-base font-bold text-white">Add New Competitor</h4>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Company / Alternative Name *</label>
                <input
                  type="text"
                  required
                  value={newComp.name}
                  onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={newComp.category}
                    onChange={(e) => setNewComp({ ...newComp, category: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Direct">Direct Competitor</option>
                    <option value="Indirect">Indirect Alternative</option>
                    <option value="Status Quo">Status Quo / Manual</option>
                    <option value="Internal Build">Internal Custom Build</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Pricing Model</label>
                  <input
                    type="text"
                    value={newComp.pricing}
                    onChange={(e) => setNewComp({ ...newComp, pricing: e.target.value })}
                    placeholder="e.g. $150k CapEx hardware"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Their Critical Weakness</label>
                <input
                  type="text"
                  value={newComp.weakness}
                  onChange={(e) => setNewComp({ ...newComp, weakness: e.target.value })}
                  placeholder="e.g. Purely reactive alarms, hardware lock-in"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Our Defensible Advantage</label>
                <input
                  type="text"
                  value={newComp.our_advantage}
                  onChange={(e) => setNewComp({ ...newComp, our_advantage: e.target.value })}
                  placeholder="e.g. 14-day advance AI anomaly predictions"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-violet hover:brightness-110 text-xs font-semibold text-white"
                >
                  Save Competitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
