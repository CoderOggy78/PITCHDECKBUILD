import {
  ProjectSummary,
  StartupIntake,
  PitchDeck,
  PitchSlide,
  ReferenceDocSummary,
  FinancialModelData,
  Competitor,
  RedTeamResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

export async function fetchProjects(): Promise<ProjectSummary[]> {
  const res = await fetch(`${API_BASE}/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(intake: StartupIntake): Promise<ProjectSummary> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intake),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function fetchPitchDeck(projectId: string): Promise<PitchDeck> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/pitch`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch pitch deck");
  return res.json();
}

export async function updateSlide(slideId: string, payload: Partial<PitchSlide>): Promise<PitchSlide> {
  const res = await fetch(`${API_BASE}/slides/${slideId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update slide");
  return res.json();
}

export async function regenerateSlide(slideId: string): Promise<PitchSlide> {
  const res = await fetch(`${API_BASE}/slides/${slideId}/regenerate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to regenerate slide");
  return res.json();
}

export async function runCopilotAction(
  slideId: string,
  action: string,
  customInstruction?: string
): Promise<{ action: string; suggestion: string; reasoning: string; citations: any[] }> {
  const res = await fetch(`${API_BASE}/slides/${slideId}/copilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slide_id: slideId, action, custom_instruction: customInstruction }),
  });
  if (!res.ok) throw new Error("Failed to run copilot action");
  return res.json();
}

export async function uploadReferences(files: File[], projectId?: string): Promise<ReferenceDocSummary[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (projectId) formData.append("project_id", projectId);

  const res = await fetch(`${API_BASE}/references/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload reference files");
  return res.json();
}

export async function fetchReferences(projectId?: string): Promise<ReferenceDocSummary[]> {
  const url = projectId ? `${API_BASE}/references?project_id=${projectId}` : `${API_BASE}/references`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch references");
  return res.json();
}

export async function fetchReferenceDetails(documentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/references/${documentId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reference details");
  return res.json();
}

export async function fetchFinancialModel(projectId: string): Promise<FinancialModelData> {
  const res = await fetch(`${API_BASE}/analytics/financial/${projectId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch financial model");
  return res.json();
}

export async function updateFinancialModel(
  projectId: string,
  assumptions: any,
  marketSize?: any
): Promise<FinancialModelData> {
  const res = await fetch(`${API_BASE}/analytics/financial/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assumptions, market_size: marketSize }),
  });
  if (!res.ok) throw new Error("Failed to update financial model");
  return res.json();
}

export async function fetchCompetitors(projectId: string): Promise<Competitor[]> {
  const res = await fetch(`${API_BASE}/analytics/competitors/${projectId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch competitors");
  return res.json();
}

export async function addCompetitor(projectId: string, competitor: Partial<Competitor>): Promise<Competitor> {
  const res = await fetch(`${API_BASE}/analytics/competitors/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(competitor),
  });
  if (!res.ok) throw new Error("Failed to add competitor");
  return res.json();
}

export async function deleteCompetitor(competitorId: string): Promise<void> {
  await fetch(`${API_BASE}/analytics/competitors/${competitorId}`, { method: "DELETE" });
}

export async function runInvestorRedTeam(projectId: string): Promise<RedTeamResponse> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/investor-red-team`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to run investor red team");
  return res.json();
}

export async function runConsistencyCheck(projectId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/consistency-check`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to run consistency check");
  return res.json();
}

export async function fetchKnowledgeAnalytics(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/knowledge`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch knowledge analytics");
  return res.json();
}
