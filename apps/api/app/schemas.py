from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Intake & Startup Profile ---
class StartupIntakeCreate(BaseModel):
    # Step 1: Idea
    name: str = Field(..., description="Startup or company name")
    one_liner: str = Field(..., description="One-line pitch or hook")
    description: str = Field(..., description="Detailed description of what is being built")
    
    # Step 2: Customer
    target_customer: str = Field(..., description="Who experiences the problem and who pays")
    business_type: str = Field(default="B2B", description="B2B, B2C, B2G, Marketplace, Hybrid")
    customer_geography: str = Field(default="North America & Global", description="Customer geography")
    customer_size: Optional[str] = Field(default="Enterprise & Mid-market", description="Target customer size")
    primary_use_cases: Optional[str] = Field(default="", description="Primary operational use cases")
    
    # Step 3: Market
    industry: str = Field(default="AI / ML", description="Industry vertical")
    stage: str = Field(default="MVP", description="Idea, Prototype, MVP, Early Revenue, Growth, Series A+")
    
    # Step 4: Existing Information (Optional)
    monetization_model: Optional[str] = Field(default="Subscription SaaS + Usage-based", description="Monetization model")
    known_competitors: Optional[str] = Field(default="", description="Known direct/indirect competitors")
    traction_details: Optional[str] = Field(default="", description="Current users, ARR, LOIs, pilot customers")
    team_details: Optional[str] = Field(default="", description="Current team backgrounds and superpowers")
    funding_raised: Optional[str] = Field(default="", description="Previous capital raised")
    funding_required: Optional[str] = Field(default="", description="Target funding ask (e.g. $2M Seed)")

    # Step 5: Visual Style & Theme Preferences
    visual_preference: Optional[str] = Field(default="ai_optimized", description="ai_optimized, graphs_financials, technical_architecture, process_funnels, minimalist_executive")
    theme_preference: Optional[str] = Field(default="dark", description="dark, light, emerald, custom")
    custom_visual_guidance: Optional[str] = Field(default="", description="User guidance for diagram types, figures, and charts")

    # Uploaded Reference Document IDs
    reference_document_ids: Optional[List[str]] = Field(default_factory=list)


class ProjectSummary(BaseModel):
    id: str
    name: str
    one_liner: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    status: str
    investor_readiness_score: float
    slide_count: int = 10
    decks_indexed: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Slide Schemas ---
class MetricItem(BaseModel):
    label: str
    value: str
    source_type: str = "AI Inference" # "Founder Provided", "Reference Pattern", "AI Inference", "Needs Validation", "Confirmed"
    detail: Optional[str] = None

class CitationItem(BaseModel):
    document_name: str
    page_number: int
    snippet: str
    category: Optional[str] = None

class ClaimItem(BaseModel):
    text: str
    confidence_type: str = "AI Inference" # "Founder Provided", "Reference Pattern", "AI Inference", "Illustrative Assumption", "Needs Validation", "Confirmed"
    rationale: Optional[str] = None

class PitchSlideUpdate(BaseModel):
    title: Optional[str] = None
    headline: Optional[str] = None
    objective: Optional[str] = None
    narrative: Optional[str] = None
    key_points: Optional[List[str]] = None
    metrics: Optional[List[Dict[str, Any]]] = None
    assumptions: Optional[List[str]] = None
    missing_information: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    supporting_evidence: Optional[List[str]] = None
    reference_patterns: Optional[List[str]] = None
    citations: Optional[List[Dict[str, Any]]] = None
    visual_recommendation: Optional[str] = None
    visual_type: Optional[str] = None
    visual_data: Optional[Dict[str, Any]] = None
    investor_question: Optional[str] = None
    speaker_notes: Optional[str] = None
    completeness_score: Optional[float] = None
    claims: Optional[List[Dict[str, Any]]] = None

class PitchSlideOut(BaseModel):
    id: str
    deck_id: str
    slide_number: int
    slide_type: str
    title: str
    headline: str
    objective: Optional[str] = None
    narrative: str
    key_points: List[str] = []
    metrics: List[Dict[str, Any]] = []
    assumptions: List[str] = []
    missing_information: List[str] = []
    risks: List[str] = []
    supporting_evidence: List[str] = []
    reference_patterns: List[str] = []
    citations: List[Dict[str, Any]] = []
    visual_recommendation: Optional[str] = None
    visual_type: Optional[str] = None
    visual_data: Dict[str, Any] = {}
    investor_question: Optional[str] = None
    speaker_notes: Optional[str] = None
    completeness_score: float = 80.0
    claims: List[Dict[str, Any]] = []
    updated_at: datetime

    class Config:
        from_attributes = True

class PitchDeckOut(BaseModel):
    id: str
    project_id: str
    title: str
    version: int
    status: str
    slides: List[PitchSlideOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Copilot & AI Actions ---
class CopilotActionRequest(BaseModel):
    action: str # "improve", "investor_friendly", "shorten", "add_metrics", "challenge_assumptions", "find_weak_claims", "reference_decks", "rewrite_headline", "visual_idea", "vc_question"
    slide_id: str
    custom_instruction: Optional[str] = None

class CopilotActionResponse(BaseModel):
    action: str
    suggestion: str
    diff_patch: Optional[Dict[str, Any]] = None
    reasoning: str
    citations: List[CitationItem] = []


# --- Red Team & Consistency ---
class RedTeamScoreBreakdown(BaseModel):
    problem_clarity: float = 85.0
    market_opportunity: float = 78.0
    differentiation: float = 82.0
    business_model: float = 80.0
    traction: float = 65.0
    gtm_strategy: float = 75.0
    team_credibility: float = 80.0
    financial_realism: float = 72.0
    fundability: float = 79.0
    story_cohesion: float = 88.0

class RedTeamResponse(BaseModel):
    project_id: str
    readiness_score: float
    scores: Dict[str, float]
    strengths: List[str]
    weaknesses: List[str]
    red_flags: List[Dict[str, Any]]
    vc_tough_questions: List[Dict[str, Any]]
    consistency_issues: List[Dict[str, Any]]
    consistency_score: float

class ConsistencyCheckResponse(BaseModel):
    consistency_score: float
    issues_found: int
    issues: List[Dict[str, Any]]


# --- Financial & Market Calculations ---
class MarketSizeInput(BaseModel):
    tam_customers: float = 50000.0
    tam_annual_spend: float = 24000.0
    sam_reachable_pct: float = 20.0
    som_penetration_pct: float = 3.5

class MarketSizeOutput(BaseModel):
    tam_value: float
    sam_value: float
    som_value: float
    tam_formula: str
    sam_formula: str
    som_formula: str
    assumptions_summary: List[str]

class FinancialAssumptionsInput(BaseModel):
    starting_cash: float = 150000.0
    monthly_burn: float = 25000.0
    funding_ask: float = 2000000.0
    target_runway_months: int = 24
    acv: float = 24000.0
    gross_margin_pct: float = 82.0
    cac: float = 4500.0
    ltv: float = 72000.0
    payback_months: float = 6.5
    y1_customers: int = 15
    y2_customers: int = 45
    y3_customers: int = 120
    y4_customers: int = 280
    y5_customers: int = 650

class FinancialProjectionYear(BaseModel):
    year: str
    customers: int
    revenue: float
    cogs: float
    gross_profit: float
    gross_margin_pct: float
    opex: float
    ebitda: float
    headcount: int
    cash_ending: float
    runway_months: float

class FinancialModelOutput(BaseModel):
    id: str
    project_id: str
    currency: str
    starting_cash: float
    monthly_burn: float
    funding_ask: float
    target_runway_months: int
    calculated_runway_months: float
    acv: float
    gross_margin_pct: float
    cac: float
    ltv: float
    ltv_cac_ratio: float
    payback_months: float
    projections: List[FinancialProjectionYear]
    market_sizing: MarketSizeOutput
    fund_allocation: List[Dict[str, Any]]


# --- Competitors ---
class CompetitorCreate(BaseModel):
    name: str
    category: str = "Direct"
    target_customer: Optional[str] = None
    pricing: Optional[str] = None
    strength: Optional[str] = None
    weakness: Optional[str] = None
    differentiator: Optional[str] = None
    our_advantage: Optional[str] = None

class CompetitorOut(CompetitorCreate):
    id: str
    project_id: str

    class Config:
        from_attributes = True


# --- Reference Document Schemas ---
class ReferenceDocSummary(BaseModel):
    id: str
    project_id: str
    filename: str
    page_count: int
    processing_status: str
    progress: int
    stage_message: str
    industry: Optional[str] = None
    detected_categories: List[str] = []
    file_size_bytes: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class ReferencePageOut(BaseModel):
    id: str
    document_id: str
    page_number: int
    category: str
    confidence: float
    text_content: str
    headings: List[str] = []
    metrics: List[Dict[str, Any]] = []
    companies: List[str] = []
    summary: Optional[str] = None
    visual_description: Optional[str] = None

    class Config:
        from_attributes = True

class ReferenceIntelligenceSummary(BaseModel):
    total_decks_indexed: int
    total_slides_analyzed: int
    index_coverage_pct: float
    top_categories: Dict[str, int]
    avg_deck_length: float
    category_distribution: List[Dict[str, Any]]
    common_narrative_flow: List[str]
    key_benchmarks: List[str]
    industry_insights: List[str]
