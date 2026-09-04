import re
from typing import Dict, Any, Tuple, List

# 16 Categories as specified
CATEGORIES = [
    "problem",
    "solution",
    "product",
    "market",
    "tam_sam_som",
    "business_model",
    "traction",
    "competition",
    "gtm",
    "team",
    "financials",
    "funding",
    "vision",
    "roadmap",
    "unit_economics",
    "other",
]

CATEGORY_KEYWORDS = {
    "problem": [
        "problem", "pain point", "challenge", "inefficiency", "current workflow", 
        "costly", "broken", "bottleneck", "fragmented", "crisis", "the struggle"
    ],
    "solution": [
        "solution", "introducing", "how it works", "value proposition", "our approach", 
        "unlocking", "the answer", "why now", "core platform", "game changer"
    ],
    "product": [
        "product", "architecture", "features", "platform overview", "demo", 
        "user experience", "screenshots", "api", "tech stack", "infrastructure"
    ],
    "market": [
        "market", "industry trends", "market size", "tailwind", "opportunity", 
        "growth rate", "cagr", "market driver", "secular shift", "billion dollar"
    ],
    "tam_sam_som": [
        "tam", "sam", "som", "total addressable", "serviceable addressable", 
        "serviceable obtainable", "bottom-up", "top-down", "market sizing"
    ],
    "business_model": [
        "business model", "monetization", "pricing", "revenue streams", "subscription", 
        "take rate", "annual contract", "tier", "saas", "how we make money"
    ],
    "traction": [
        "traction", "growth", "revenue", "arr", "mrr", "customers", "users", 
        "case study", "pilots", "retention", "loi", "pipeline", "milestones"
    ],
    "competition": [
        "competition", "competitive landscape", "competitors", "quadrant", 
        "matrix", "vs", "alternatives", "moat", "defensibility", "why we win"
    ],
    "gtm": [
        "go-to-market", "gtm", "distribution", "sales motion", "customer acquisition", 
        "cac", "inbound", "outbound", "partnerships", "channel", "land and expand"
    ],
    "team": [
        "team", "founders", "leadership", "background", "advisors", "experience", 
        "co-founder", "cto", "ceo", "ex-google", "alumni", "who we are"
    ],
    "financials": [
        "financials", "projections", "p&l", "ebitda", "gross margin", "burn rate", 
        "runway", "operating expenses", "cash flow", "forecast", "5-year"
    ],
    "funding": [
        "funding", "ask", "raising", "use of funds", "round", "seed", "series a", 
        "milestones", "allocation", "investment opportunity", "terms"
    ],
    "vision": [
        "vision", "long-term", "mission", "future of", "expanding into", 
        "the future", "transforming the industry", "our mission"
    ],
    "roadmap": [
        "roadmap", "timeline", "future releases", "q1", "q2", "q3", "q4", 
        "milestones", "phase 1", "phase 2", "launch schedule"
    ],
    "unit_economics": [
        "unit economics", "ltv", "cac", "payback period", "contribution margin", 
        "magic number", "net revenue retention", "arpu", "acv"
    ]
}

class SlideClassifier:
    @staticmethod
    def classify_page(text: str, headings: List[str] = None, page_num: int = 1, total_pages: int = 10) -> Dict[str, Any]:
        """
        Classifies slide page text into one of the standardized categories with confidence score.
        Incorporates positional heuristics (e.g. team / funding ask usually near the end; problem near front).
        """
        text_lower = (text or "").lower()
        heading_text = " ".join(headings or []).lower()
        combined = f"{heading_text} {heading_text} {text_lower}" # weight headings higher

        scores: Dict[str, float] = {cat: 0.0 for cat in CATEGORIES}

        # 1. Keyword frequency scoring
        for cat, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                # Whole word match or substring
                count = len(re.findall(rf"\b{re.escape(kw)}\b", combined))
                if count > 0:
                    scores[cat] += count * (3.0 if kw in heading_text else 1.0)

        # 2. Positional heuristics (decks follow standard venture narrative arch)
        rel_pos = page_num / max(total_pages, 1)
        if rel_pos <= 0.35: # Early pages
            scores["problem"] *= 1.4
            scores["solution"] *= 1.3
            scores["product"] *= 1.2
        elif 0.35 < rel_pos <= 0.75: # Middle pages
            scores["market"] *= 1.2
            scores["tam_sam_som"] *= 1.3
            scores["business_model"] *= 1.3
            scores["traction"] *= 1.3
            scores["competition"] *= 1.3
            scores["gtm"] *= 1.2
        else: # End pages
            scores["team"] *= 1.5
            scores["financials"] *= 1.4
            scores["funding"] *= 1.6
            scores["roadmap"] *= 1.2
            scores["vision"] *= 1.2

        # 3. Best category calculation
        best_cat = "other"
        best_score = 0.0
        total_score = sum(scores.values())

        for cat, score in scores.items():
            if score > best_score:
                best_score = score
                best_cat = cat

        # Map tam_sam_som to market/tam if desired, or keep specific
        confidence = min(0.95, round((best_score / max(total_score, 1.0)) * 0.7 + (0.3 if best_score > 3 else 0.1), 2))
        if best_score < 1.0:
            best_cat = "other"
            confidence = 0.35

        # Extract brief visual description
        visual_desc = SlideClassifier._infer_visual_type(best_cat, text_lower)
        summary = SlideClassifier._generate_summary(best_cat, text)

        return {
            "category": best_cat,
            "confidence": confidence,
            "summary": summary,
            "visual_description": visual_desc,
            "scores": {k: round(v, 2) for k, v in scores.items() if v > 0}
        }

    @staticmethod
    def _infer_visual_type(category: str, text: str) -> str:
        visual_map = {
            "problem": "Pain point bottleneck workflow or problem cost breakdown",
            "solution": "3-pillar product diagram or platform architecture overview",
            "product": "UI mockups, interactive interface demo or workflow steps",
            "market": "TAM / SAM / SOM nested concentric circles or CAGR bar chart",
            "tam_sam_som": "Concentric circle market sizing diagram (TAM / SAM / SOM)",
            "business_model": "Revenue stream flywheel and tiered pricing grid",
            "traction": "MoM / YoY ARR growth curve and key customer logos",
            "competition": "2x2 positioning quadrant or multi-attribute feature matrix",
            "gtm": "Funnel conversion roadmap (0-6mo, 6-18mo, 18-36mo)",
            "team": "Founder cards with headshots, pedigree badges and past exits",
            "financials": "5-year revenue, gross margin, and EBITDA forecast chart",
            "funding": "Cap-table allocation donut chart with key milestone unlocks",
            "vision": "Long-term market expansion horizon roadmap",
            "roadmap": "Quarterly milestone Gantt / delivery track",
            "unit_economics": "LTV vs CAC payback curve and cohort retention charts",
            "other": "Structured informative key-point cards"
        }
        return visual_map.get(category, "Structured information layout")

    @staticmethod
    def _generate_summary(category: str, text: str) -> str:
        cleaned = " ".join(text.split()[:40])
        if len(cleaned) < 10:
            return f"Overview of {category.replace('_', ' ').title()} information."
        return f"{category.replace('_', ' ').title()} slide emphasizing: {cleaned}..."
