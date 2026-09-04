from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Project, PitchDeck, FinancialModel, PitchSlide

class ConsistencyEngine:
    @staticmethod
    async def validate_deck(db: AsyncSession, project_id: str) -> Dict[str, Any]:
        """
        Runs comprehensive cross-slide consistency validation.
        Flags logical mismatches between target market, pricing, GTM capacity, hiring, and runway math.
        """
        deck_stmt = select(PitchDeck).where(PitchDeck.project_id == project_id)
        d_res = await db.execute(deck_stmt)
        deck = d_res.scalar_one_or_none()

        fin_stmt = select(FinancialModel).where(FinancialModel.project_id == project_id)
        f_res = await db.execute(fin_stmt)
        fin = f_res.scalar_one_or_none()

        issues = []
        base_score = 100.0

        if not deck or not deck.slides:
            return {
                "consistency_score": 100.0,
                "issues_found": 0,
                "issues": []
            }

        slides_by_type = {s.slide_type: s for s in deck.slides}

        # Rule 1: Runway stated vs Monthly Burn check
        if fin:
            stated_runway = fin.target_runway_months or 24
            implied_runway = (fin.starting_cash + fin.funding_ask) / max(fin.monthly_burn, 1.0)
            if implied_runway < (stated_runway * 0.75):
                issues.append({
                    "rule": "Runway Math Verification",
                    "slide_a": "Slide 10 (Funding Ask)",
                    "slide_b": "Slide 08 (Financial Model)",
                    "severity": "High",
                    "description": f"Funding ask of ${fin.funding_ask:,.0f} with monthly burn of ${fin.monthly_burn:,.0f} supports {implied_runway:.1f} months of runway, which is below the stated {stated_runway}-month target.",
                    "fix": "Increase funding ask or reduce initial headcount expansion schedule."
                })
                base_score -= 12.0

            # Rule 2: Unit Economics Sanity Check (LTV : CAC)
            if fin.cac > 0 and fin.ltv > 0:
                ratio = fin.ltv / fin.cac
                if ratio < 3.0:
                    issues.append({
                        "rule": "Unit Economics Threshold",
                        "slide_a": "Slide 04 (Business Model)",
                        "slide_b": "Slide 08 (Financials)",
                        "severity": "Medium",
                        "description": f"LTV/CAC ratio is {ratio:.1f}x (industry standard benchmark for enterprise venture deals is >3.0x).",
                        "fix": "Improve pricing tier monetization or optimize acquisition channels."
                    })
                    base_score -= 8.0

        # Rule 3: GTM Headcount vs Year 1-2 Customer Target
        gtm_slide = slides_by_type.get("gtm")
        fin_slide = slides_by_type.get("financials")
        if gtm_slide and fin_slide and fin and fin.projections:
            y2_customers = fin.projections[1].get("customers", 45) if len(fin.projections) > 1 else 45
            if y2_customers > 60 and "direct sales" in gtm_slide.narrative.lower():
                issues.append({
                    "rule": "GTM Acquisition Capacity",
                    "slide_a": "Slide 06 (GTM Strategy)",
                    "slide_b": "Slide 08 (Financials)",
                    "severity": "Low",
                    "description": f"Targeting {y2_customers} enterprise closes in Year 2 requires at least 3 dedicated account executives assuming standard enterprise quota capacity.",
                    "fix": "Explicitly mention sales rep headcount ramp on GTM slide."
                })
                base_score -= 5.0

        # Rule 4: Enterprise ICP vs ACV Pricing Alignment
        biz_slide = slides_by_type.get("business_model")
        prob_slide = slides_by_type.get("problem")
        if biz_slide and prob_slide and fin:
            if "enterprise" in prob_slide.narrative.lower() and fin.acv < 5000:
                issues.append({
                    "rule": "Enterprise Pricing Alignment",
                    "slide_a": "Slide 01 (Problem)",
                    "slide_b": "Slide 04 (Business Model)",
                    "severity": "High",
                    "description": f"Problem slide defines target customer as Enterprise, but ACV is set to ${fin.acv:,.0f}/yr (Enterprise software typically commands >$20,000 ACV).",
                    "fix": "Adjust base enterprise contract tiers to reflect enterprise procurement economics."
                })
                base_score -= 15.0

        return {
            "consistency_score": max(50.0, round(base_score, 1)),
            "issues_found": len(issues),
            "issues": issues
        }
