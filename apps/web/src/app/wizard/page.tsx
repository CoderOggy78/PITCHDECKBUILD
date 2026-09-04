"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Shield,
  Layers,
  Cpu,
  BarChart3,
  GitBranch,
  LayoutGrid,
  Sun,
  Moon
} from "lucide-react";
import Image from "next/image";
import { createProject, uploadReferences } from "@/lib/api";
import { StartupIntake } from "@/lib/types";

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orchestrationStatus, setOrchestrationStatus] = useState("");

  // Clean Form State with visual & theme preferences
  const [formData, setFormData] = useState<StartupIntake>({
    name: "",
    one_liner: "",
    description: "",
    target_customer: "",
    business_type: "B2B Enterprise",
    customer_geography: "",
    customer_size: "",
    primary_use_cases: "",
    industry: "AI / ML",
    stage: "Idea",
    monetization_model: "",
    known_competitors: "",
    traction_details: "",
    team_details: "",
    funding_required: "",
    visual_preference: "ai_optimized",
    theme_preference: "dark",
    custom_visual_guidance: "",
    reference_document_ids: []
  });

  // Reference Deck Upload State
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; name: string; size: string; status: string; progress: number }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateField = (field: keyof StartupIntake, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);

    try {
      const summaries = await uploadReferences(files);
      const newFiles = summaries.map((s) => ({
        id: s.id,
        name: s.filename,
        size: `${(s.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`,
        status: "Ready",
        progress: 100,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setFormData((prev) => ({
        ...prev,
        reference_document_ids: [...(prev.reference_document_ids || []), ...summaries.map((s) => s.id)],
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    setFormData((prev) => ({
      ...prev,
      reference_document_ids: (prev.reference_document_ids || []).filter((docId) => docId !== id),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Please provide a name for your startup.");
      return;
    }
    setIsSubmitting(true);
    const stages = [
      "1. Synthesizing startup concept & value proposition...",
      "2. Tailoring visual archetypes & figure layouts...",
      "3. Sizing bottom-up TAM / SAM / SOM formulas...",
      "4. Engineering 10 high-accuracy investor slides...",
      "5. Applying light/dark theme formatting & consistency checks...",
      "6. Finalizing your presentation blueprint..."
    ];

    let stageIdx = 0;
    setOrchestrationStatus(stages[0]);
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setOrchestrationStatus(stages[stageIdx]);
      }
    }, 900);

    try {
      const project = await createProject(formData);
      clearInterval(interval);
      router.push(`/project/${project.id}`);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Nature Landscape Painting Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/nature-bg.jpg"
          alt="Impressionist autumn nature meadow"
          fill
          priority
          className="object-cover object-center opacity-90 scale-105"
        />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Content Container Floating on Top */}
      <div className="relative z-10 mx-auto max-w-4xl w-full">
        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-slate-300 mb-3 drop-shadow">
            <span>Step 0{step} of 05</span>
            <span className="text-sky-600 dark:text-brand-cyan font-bold">
              {step === 1 && "The Core Idea"}
              {step === 2 && "Customer & Audience"}
              {step === 3 && "Market & Economics"}
              {step === 4 && "Visuals, Graphs & Theme Preferences"}
              {step === 5 && "Reference Pitch Decks (Optional)"}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-slate-900 dark:bg-white" : "bg-white/40 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Form Card Floating on Nature Backdrop */}
        <div className="glass-panel rounded-[32px] p-8 sm:p-12 border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden bg-white/95 dark:bg-[#0A0D14]/90 backdrop-blur-2xl">
        {/* STEP 1: The Idea */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">01 / Concept</span>
              <h2 className="font-serif-hero text-3xl sm:text-4xl font-normal text-white mt-1">Your Startup Concept</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                Tell us about your venture. We'll engineer an institutional 10-slide pitch blueprint.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Startup / Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. NextLayer, Solara Health, DeepPulse..."
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  One-Line Pitch *
                </label>
                <input
                  type="text"
                  value={formData.one_liner}
                  onChange={(e) => updateField("one_liner", e.target.value)}
                  placeholder="e.g. Autonomous zero-trust cloud security for multi-cloud Kubernetes clusters."
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Detailed Description &amp; Problem Solved *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the core problem, how your technology solves it, what the status-quo friction is, and why now is the right moment..."
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none leading-relaxed font-light"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Customer */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">02 / Target Audience</span>
              <h2 className="font-serif-hero text-3xl sm:text-4xl font-normal text-white mt-1">Target Customer &amp; Persona</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                Define who experiences the acute pain point, who holds the budget, and their operational environment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Ideal Customer Profile &amp; Buyer Persona *
                </label>
                <input
                  type="text"
                  value={formData.target_customer}
                  onChange={(e) => updateField("target_customer", e.target.value)}
                  placeholder="e.g. Enterprise CISOs, VP of Cloud Engineering, Head of Infrastructure"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Business Model Type</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => updateField("business_type", e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                >
                  <option value="B2B Enterprise">B2B Enterprise SaaS</option>
                  <option value="B2B SaaS / Mid-Market">B2B SaaS (Mid-Market)</option>
                  <option value="B2B Usage / API">B2B Usage-Based / API</option>
                  <option value="B2G / Public Sector">B2G / Public Sector</option>
                  <option value="Marketplace">Marketplace / Platform</option>
                  <option value="B2C / Consumer">B2C / Consumer</option>
                  <option value="Hardware + SaaS">Hardware + SaaS Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Target Geography</label>
                <input
                  type="text"
                  value={formData.customer_geography}
                  onChange={(e) => updateField("customer_geography", e.target.value)}
                  placeholder="e.g. Global, North America & Europe, APAC"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Primary Customer Use Cases
                </label>
                <input
                  type="text"
                  value={formData.primary_use_cases}
                  onChange={(e) => updateField("primary_use_cases", e.target.value)}
                  placeholder="e.g. Automated threat response, audit compliance, zero-trust cloud configuration"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Market & Economics */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">03 / Market &amp; Economics</span>
              <h2 className="font-serif-hero text-3xl sm:text-4xl font-normal text-white mt-1">Market Vertical &amp; Economics</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                Provide pricing and funding goals so our deterministic engine builds your bottom-up TAM/SAM/SOM and 5-year financials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Industry Vertical *</label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                >
                  <option value="AI / ML">AI / ML Infrastructure</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="FinTech">FinTech / Payments</option>
                  <option value="HealthTech / BioTech">HealthTech / BioTech</option>
                  <option value="ClimateTech / Energy">ClimateTech / Energy</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="DefenceTech / GovTech">DefenceTech / GovTech</option>
                  <option value="Logistics / Supply Chain">Logistics / Supply Chain</option>
                  <option value="DeepTech / Robotics">DeepTech / Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Startup Stage *</label>
                <select
                  value={formData.stage}
                  onChange={(e) => updateField("stage", e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                >
                  <option value="Idea">Idea / Concept</option>
                  <option value="Prototype">Prototype / Alpha</option>
                  <option value="MVP">MVP / Active Pilot</option>
                  <option value="Early Revenue">Early Revenue / Seed</option>
                  <option value="Growth">Growth / Series A</option>
                  <option value="Series A+">Series A+ / Expansion</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Pricing / Annual Contract Value (ACV)
                </label>
                <input
                  type="text"
                  value={formData.monetization_model}
                  onChange={(e) => updateField("monetization_model", e.target.value)}
                  placeholder="e.g. $45,000/yr per enterprise account + compute tiering"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Funding Target Ask
                </label>
                <input
                  type="text"
                  value={formData.funding_required}
                  onChange={(e) => updateField("funding_required", e.target.value)}
                  placeholder="e.g. $2,000,000 Seed"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Known Competitors
                </label>
                <input
                  type="text"
                  value={formData.known_competitors}
                  onChange={(e) => updateField("known_competitors", e.target.value)}
                  placeholder="e.g. Palo Alto Networks, Datadog, Sysdig"
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Visuals, Figures & Theme Preferences */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">04 / Visual Structure &amp; Theme</span>
              <h2 className="font-serif-hero text-3xl sm:text-4xl font-normal text-white mt-1">
                Visual Archetypes &amp; Presentation Style
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                Choose the visual style and color theme for your pitch deck and PowerPoint slides.
              </p>
            </div>

            {/* Diagram / Visual Archetype Options */}
            <div className="space-y-3">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Select Preferred Visual / Diagram Type *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "ai_optimized",
                    title: "AI Auto-Optimized (Recommended)",
                    desc: "Intelligently pairs each slide with the most effective archetype (2x2 quadrants, funnels, pillars, charts).",
                    icon: Sparkles
                  },
                  {
                    id: "graphs_financials",
                    title: "Data & Financial Graphs",
                    desc: "Emphasizes bottom-up TAM circles, 5-year revenue bar charts, and unit economics meters.",
                    icon: BarChart3
                  },
                  {
                    id: "technical_architecture",
                    title: "Technical & System Architecture",
                    desc: "Focuses on 3-pillar architectural transformations, data pipelines, and defensibility models.",
                    icon: Cpu
                  },
                  {
                    id: "process_funnels",
                    title: "Process & GTM Roadmaps",
                    desc: "Emphasizes bottleneck friction funnels, customer lifecycle workflows, and 3-phase roadmaps.",
                    icon: GitBranch
                  }
                ].map((archetype) => {
                  const Icon = archetype.icon;
                  const isSelected = (formData.visual_preference || "ai_optimized") === archetype.id;
                  return (
                    <button
                      key={archetype.id}
                      type="button"
                      onClick={() => updateField("visual_preference", archetype.id)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-white/[0.08] border-white text-white shadow-glow-violet"
                          : "bg-black/30 border-white/10 text-slate-300 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-brand-cyan" : "text-slate-400"}`} />
                        <span className="text-xs font-semibold text-white">{archetype.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                        {archetype.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presentation Theme Selector (Dark / Light) */}
            <div className="space-y-3 pt-2">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Default Presentation Theme (PowerPoint &amp; Web) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField("theme_preference", "dark")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    formData.theme_preference === "dark"
                      ? "bg-white/[0.08] border-white text-white"
                      : "bg-black/30 border-white/10 text-slate-300"
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Midnight Obsidian (Dark)</div>
                    <div className="text-[10px] text-slate-400">Cinematic dark palette with electric accents</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField("theme_preference", "light")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                    formData.theme_preference === "light"
                      ? "bg-white/[0.08] border-white text-white"
                      : "bg-black/30 border-white/10 text-slate-300"
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-white text-black flex items-center justify-center">
                    <Sun className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Clean Institutional (Light)</div>
                    <div className="text-[10px] text-slate-400">High-contrast white paper with royal blue accents</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Visual Guidance Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Custom Visual or Figure Guidance (Optional)
              </label>
              <input
                type="text"
                value={formData.custom_visual_guidance || ""}
                onChange={(e) => updateField("custom_visual_guidance", e.target.value)}
                placeholder="e.g. 'Highlight our 82% gross margins with bar charts', 'Include Kubernetes cluster flow on slide 2'..."
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-white focus:outline-none font-light"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Reference Deck Uploader (Optional) */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan">05 / Reference Grounding</span>
              <h2 className="font-serif-hero text-3xl sm:text-4xl font-normal text-white mt-1">
                Upload Reference Pitch Decks (Optional)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                Upload real competitor or aspirational PDF decks. Our pipeline extracts their structure and grounds citations in your blueprint.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div className="relative rounded-2xl border-2 border-dashed border-white/15 bg-black/30 p-8 text-center hover:border-white/40 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-white">
                  {isUploading ? "Extracting & Embedding PDFs..." : "Drop PDF Pitch Decks Here"}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-light">
                  Upload PDF reference decks (up to 20 files) • Or skip to generate directly
                </p>
              </div>
            </div>

            {/* Uploaded File List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Attached Reference Decks ({uploadedFiles.length})</span>
                  <span className="text-emerald-400">RAG ready</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="h-4 w-4 text-brand-violet flex-shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-white truncate max-w-xs">{file.name}</div>
                          <div className="text-[10px] text-slate-400">{file.size}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          {file.status}
                        </span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !formData.name.trim()) {
                  alert("Please enter a startup or project name.");
                  return;
                }
                setStep((s) => s + 1);
              }}
              className="glass-pill flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold !text-white shadow-glow-violet transition-all"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5 !stroke-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="glass-pill flex items-center gap-2.5 px-8 py-3 rounded-full text-xs sm:text-sm font-semibold !text-white shadow-glow-violet transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin !stroke-white" />
                  Forging Pitch Blueprint...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 !stroke-white" />
                  Generate Investor Blueprint
                </>
              )}
            </button>
          )}
        </div>

        {/* Live Generation Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-[#06080D]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-50">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Cpu className="h-8 w-8 text-brand-cyan animate-spin" />
            </div>
            <h3 className="font-serif-hero text-3xl text-white">Architecting Your Pitch Blueprint</h3>
            <p className="text-xs font-mono text-brand-cyan mt-3">{orchestrationStatus}</p>
            <p className="text-xs text-slate-400 mt-2 max-w-sm font-light">
              Tailoring diagrams, financials, and presentation slides to your chosen preferences...
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
