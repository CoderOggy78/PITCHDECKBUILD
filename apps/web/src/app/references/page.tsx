"use client";

import { useEffect, useState } from "react";
import {
  fetchReferences,
  fetchReferenceDetails,
  uploadReferences,
} from "@/lib/api";
import { ReferenceDocSummary, ReferencePage } from "@/lib/types";
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Cpu,
  Trash2,
  Eye,
  TrendingUp,
  Tag,
  Plus
} from "lucide-react";
import Image from "next/image";

export default function ReferencesPage() {
  const [documents, setDocuments] = useState<ReferenceDocSummary[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ReferenceDocSummary | null>(null);
  const [selectedDocPages, setSelectedDocPages] = useState<ReferencePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      const docs = await fetchReferences();
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        handleSelectDoc(docs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSelectDoc = async (doc: ReferenceDocSummary) => {
    setSelectedDoc(doc);
    setActivePageIndex(0);
    try {
      const details = await fetchReferenceDetails(doc.id);
      setSelectedDocPages(details.pages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const files = Array.from(e.target.files);
      await uploadReferences(files);
      await loadDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const activePage = selectedDocPages[activePageIndex];

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
            Empirical Pitch Intelligence
          </span>
          <h1 className="font-serif-hero text-4xl sm:text-5xl font-normal text-white mt-1">
            Reference Deck Library &amp; Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light">
            Inspect indexed pitch decks, review slide category classifications, and trace RAG citations.
          </p>
        </div>

        {/* Upload Button */}
        <label className="glass-pill px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-white shadow-glow-violet transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span>{isUploading ? "Extracting..." : "Upload Reference PDF"}</span>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {documents.length === 0 && !loading ? (
        <div className="glass-panel rounded-3xl p-12 sm:p-16 text-center border border-white/10 max-w-2xl mx-auto space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
            <FileText className="h-8 w-8 text-brand-violet" />
          </div>
          <h3 className="font-serif-hero text-3xl text-white font-normal">
            No Reference Decks Uploaded
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
            Upload PDF pitch decks from industry leaders or competitors. VentureForge parses and embeds their structure into dense semantic vectors to ground your slides.
          </p>
          <div className="pt-2">
            <label className="glass-pill inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white shadow-glow-violet transition-all hover:scale-105 active:scale-95 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>{isUploading ? "Uploading & Embedding..." : "Upload PDF Pitch Decks"}</span>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        /* Main Two-Column Analysis Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Reference Decks List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Indexed Decks ({documents.length})</span>
              <span className="text-emerald-400">pgvector ready</span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`w-full text-left p-5 rounded-2xl transition-all border ${
                      isSelected
                        ? "glass-panel bg-white/[0.08] border-white/40 text-white shadow-glow-violet"
                        : "glass-panel-interactive border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-serif-hero text-xl text-white truncate">{doc.filename}</div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {doc.processing_status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>{doc.page_count} Pages</span>
                      <span>•</span>
                      <span>{(doc.file_size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>

                    {doc.detected_categories && doc.detected_categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {doc.detected_categories.slice(0, 4).map((cat) => (
                          <span
                            key={cat}
                            className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5 font-mono capitalize"
                          >
                            {cat.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: PDF Slide Analysis & Extracted Signals */}
          <div className="lg:col-span-8 space-y-4">
            {selectedDoc ? (
              <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-6">
                {/* Selected Deck Meta */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="font-serif-hero text-3xl text-white">{selectedDoc.filename}</h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {selectedDoc.page_count} segmented slides with dense semantic vectors.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {selectedDoc.stage_message || "Indexed & RAG Ready"}
                    </span>
                  </div>
                </div>

                {/* Page Selector Strip */}
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2.5">
                    Select Slide Page to Inspect
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedDocPages.map((p, idx) => (
                      <button
                        key={p.id || idx}
                        onClick={() => setActivePageIndex(idx)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-mono transition-all border ${
                          idx === activePageIndex
                            ? "bg-white text-black font-bold border-white"
                            : "bg-white/5 text-slate-400 hover:text-white border-white/10"
                        }`}
                      >
                        P.{p.page_number} ({p.category})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Page Detailed Inspector */}
                {activePage ? (
                  <div className="space-y-4 bg-black/50 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 uppercase">
                          Page {activePage.page_number} Classification:
                        </span>
                        <span className="text-xs font-bold text-white bg-white/10 px-3 py-0.5 rounded-full border border-white/20 capitalize font-mono">
                          {activePage.category.replace("_", " ")}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-emerald-400">
                        {Math.round(activePage.confidence * 100)}% Confidence
                      </span>
                    </div>

                    {/* Visual Description */}
                    {activePage.visual_description && (
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-brand-cyan">Visual Architecture: </span>
                        {activePage.visual_description}
                      </div>
                    )}

                    {/* Extracted Page Text */}
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                        Extracted Text Content
                      </div>
                      <div className="rounded-xl bg-black/60 p-4 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto border border-white/5">
                        {activePage.text_content || "No text extracted on this slide."}
                      </div>
                    </div>

                    {/* Detected Metrics & Companies */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {activePage.metrics && activePage.metrics.length > 0 && (
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                          <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                            Detected Metrics &amp; Values
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activePage.metrics.map((m, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 font-mono font-bold"
                              >
                                {m.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activePage.companies && activePage.companies.length > 0 && (
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                          <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                            Detected Competitors / Entities
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activePage.companies.map((c, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 py-12 font-mono">
                    Select a slide page from the strip above to inspect extracted signals.
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="font-serif-hero text-2xl text-white">No Reference Deck Selected</h3>
                <p className="text-xs text-slate-400 mt-1 font-light">
                  Select a document from the left column or upload a new pitch deck PDF.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
