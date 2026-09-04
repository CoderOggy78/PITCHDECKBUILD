"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { runInvestorRedTeam, runConsistencyCheck } from "@/lib/api";
import { RedTeamResponse } from "@/lib/types";
import { CritiqueView } from "@/components/red-team/critique-view";
import { ConsistencyView } from "@/components/red-team/consistency-view";
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react";

export default function RedTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [report, setReport] = useState<RedTeamResponse | null>(null);
  const [consistency, setConsistency] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRerunning, setIsRerunning] = useState(false);

  const loadData = async () => {
    try {
      const [r, c] = await Promise.all([
        runInvestorRedTeam(projectId),
        runConsistencyCheck(projectId),
      ]);
      setReport(r);
      setConsistency(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRerunning(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleRerun = () => {
    setIsRerunning(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-violet" />
          <span className="text-sm font-mono text-slate-400">Running Investor Red Team Audit...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/project/${projectId}`}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to 10-Slide Blueprint
        </Link>
      </div>

      {report && (
        <CritiqueView report={report} onRerun={handleRerun} isRerunning={isRerunning} />
      )}

      {consistency && (
        <ConsistencyView
          consistencyScore={consistency.consistency_score}
          issues={consistency.issues}
          onRerun={handleRerun}
          isRerunning={isRerunning}
        />
      )}
    </div>
  );
}
