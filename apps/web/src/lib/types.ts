export interface MetricItem {
  label: string;
  value: string;
  source_type: string; // "Founder Provided" | "Reference Pattern" | "AI Inference" | "Needs Validation" | "Confirmed"
  detail?: string;
}

export interface CitationItem {
  document_name: string;
  page_number: number;
  snippet: string;
  category?: string;
}

export interface ClaimItem {
  text: string;
  confidence_type: string; // "Founder Provided" | "Reference Pattern" | "AI Inference" | "Illustrative Assumption" | "Needs Validation" | "Confirmed"
  rationale?: string;
}

export interface PitchSlide {
  id: string;
  deck_id: string;
  slide_number: number;
  slide_type: string;
  title: string;
  headline: string;
  objective?: string;
  narrative: string;
  key_points: string[];
  metrics: MetricItem[];
  assumptions: string[];
  missing_information: string[];
  risks: string[];
  supporting_evidence: string[];
  reference_patterns: string[];
  citations: CitationItem[];
  visual_recommendation?: string;
  visual_type?: string;
  visual_data?: any;
  investor_question?: string;
  speaker_notes?: string;
  completeness_score: number;
  claims: ClaimItem[];
  updated_at: string;
}

export interface PitchDeck {
  id: string;
  project_id: string;
  title: string;
  version: number;
  status: string;
  slides: PitchSlide[];
  created_at: string;
  updated_at: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  one_liner?: string;
  industry?: string;
  stage?: string;
  status: string;
  investor_readiness_score: number;
  slide_count: number;
  decks_indexed: number;
  created_at: string;
  updated_at: string;
}

export interface StartupIntake {
  name: string;
  one_liner: string;
  description: string;
  target_customer: string;
  business_type?: string;
  customer_geography?: string;
  customer_size?: string;
  primary_use_cases?: string;
  industry: string;
  stage: string;
  monetization_model?: string;
  known_competitors?: string;
  traction_details?: string;
  team_details?: string;
  funding_raised?: string;
  funding_required?: string;
  visual_preference?: string;
  theme_preference?: string;
  custom_visual_guidance?: string;
  reference_document_ids?: string[];
}

export interface ReferenceDocSummary {
  id: string;
  project_id: string;
  filename: string;
  page_count: number;
  processing_status: string;
  progress: number;
  stage_message: string;
  industry?: string;
  detected_categories: string[];
  file_size_bytes: number;
  created_at: string;
}

export interface ReferencePage {
  id: string;
  document_id: string;
  page_number: number;
  category: string;
  confidence: number;
  text_content: string;
  headings: string[];
  metrics: MetricItem[];
  companies: string[];
  summary?: string;
  visual_description?: string;
}

export interface FinancialProjectionYear {
  year: string;
  customers: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  opex: number;
  ebitda: number;
  headcount: number;
  cash_ending: number;
  runway_months: number;
}

export interface MarketSizing {
  tam_value: number;
  sam_value: number;
  som_value: number;
  tam_formula: string;
  sam_formula: string;
  som_formula: string;
  assumptions_summary: string[];
}

export interface FinancialModelData {
  id: string;
  project_id: string;
  currency: string;
  starting_cash: number;
  monthly_burn: number;
  funding_ask: number;
  target_runway_months: number;
  calculated_runway_months: number;
  acv: number;
  gross_margin_pct: number;
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  payback_months: number;
  projections: FinancialProjectionYear[];
  market_sizing: MarketSizing;
  fund_allocation: Array<{
    category: string;
    percentage: number;
    amount: number;
    description: string;
  }>;
}

export interface Competitor {
  id: string;
  project_id: string;
  name: string;
  category: string;
  target_customer?: string;
  pricing?: string;
  strength?: string;
  weakness?: string;
  differentiator?: string;
  our_advantage?: string;
}

export interface RedTeamResponse {
  project_id: string;
  readiness_score: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  red_flags: Array<{
    slide: string;
    severity: string;
    issue: string;
    recommendation: string;
  }>;
  vc_tough_questions: Array<{
    question: string;
    context: string;
    suggested_answer: string;
  }>;
  consistency_issues: Array<{
    rule: string;
    slide_a: string;
    slide_b: string;
    description: string;
    severity: string;
  }>;
  consistency_score: number;
}
