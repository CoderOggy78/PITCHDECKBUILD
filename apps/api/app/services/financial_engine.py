from typing import Dict, Any, List
from app.schemas import (
    MarketSizeInput,
    MarketSizeOutput,
    FinancialAssumptionsInput,
    FinancialProjectionYear,
    FinancialModelOutput
)

class FinancialEngine:
    @staticmethod
    def calculate_market_size(input_data: MarketSizeInput) -> MarketSizeOutput:
        """
        Calculates bottom-up TAM, SAM, and SOM deterministically.
        TAM = Total Target Customers × Annual Spend
        SAM = Reachable Segment (% of TAM)
        SOM = Realizable 3-5 Year Penetration (% of SAM)
        """
        tam = input_data.tam_customers * input_data.tam_annual_spend
        sam = tam * (input_data.sam_reachable_pct / 100.0)
        som = sam * (input_data.som_penetration_pct / 100.0)

        def fmt(num: float) -> str:
            if num >= 1_000_000_000:
                return f"${num / 1_000_000_000:.2f}B"
            elif num >= 1_000_000:
                return f"${num / 1_000_000:.2f}M"
            elif num >= 1_000:
                return f"${num / 1_000:.1f}K"
            return f"${num:,.0f}"

        return MarketSizeOutput(
            tam_value=tam,
            sam_value=sam,
            som_value=som,
            tam_formula=f"{int(input_data.tam_customers):,} target orgs × ${int(input_data.tam_annual_spend):,}/yr = {fmt(tam)}",
            sam_formula=f"{input_data.sam_reachable_pct:.1f}% reachable geography/segment = {fmt(sam)}",
            som_formula=f"{input_data.som_penetration_pct:.1f}% capture rate within 36 months = {fmt(som)}",
            assumptions_summary=[
                f"Global Target Accounts: {int(input_data.tam_customers):,}",
                f"Assumed Annual Contract Value (ACV): ${int(input_data.tam_annual_spend):,}",
                f"Serviceable Segment: {input_data.sam_reachable_pct}% of total universe",
                f"3-Year Target Market Capture: {input_data.som_penetration_pct}% of SAM"
            ]
        )

    @staticmethod
    def calculate_projections(
        assumptions: FinancialAssumptionsInput,
        market_size: MarketSizeInput = None
    ) -> Dict[str, Any]:
        """
        Calculates full 5-year deterministic financial forecast, cash burn, unit economics, and runway.
        """
        cust_years = [
            ("Year 1", assumptions.y1_customers, 6),
            ("Year 2", assumptions.y2_customers, 14),
            ("Year 3", assumptions.y3_customers, 28),
            ("Year 4", assumptions.y4_customers, 52),
            ("Year 5", assumptions.y5_customers, 95),
        ]

        projections: List[FinancialProjectionYear] = []
        current_cash = assumptions.starting_cash + assumptions.funding_ask

        # Dynamic Unit Economics
        ltv_cac = round(assumptions.ltv / max(assumptions.cac, 1.0), 2)
        calculated_runway = round(current_cash / max(assumptions.monthly_burn, 1.0), 1)

        for y_idx, (year_name, cust_count, headcount) in enumerate(cust_years):
            revenue = cust_count * assumptions.acv
            cogs = revenue * ((100.0 - assumptions.gross_margin_pct) / 100.0)
            gross_profit = revenue - cogs
            
            # OpEx model: Personnel cost (~$140k/yr per avg head) + Fixed/GTM scaling
            personnel_opex = headcount * 135_000
            sales_marketing_opex = (cust_count * assumptions.cac * 0.8) + 50_000
            general_rd_opex = 75_000 + (headcount * 15_000)
            total_opex = personnel_opex + sales_marketing_opex + general_rd_opex
            
            ebitda = gross_profit - total_opex
            
            # Cash flow simulation
            current_cash += ebitda
            annual_monthly_burn = max(total_opex - gross_profit, 0) / 12.0
            runway = round(max(current_cash, 0) / max(annual_monthly_burn, 1.0), 1) if annual_monthly_burn > 0 else 48.0

            projections.append(FinancialProjectionYear(
                year=year_name,
                customers=cust_count,
                revenue=round(revenue, 2),
                cogs=round(cogs, 2),
                gross_profit=round(gross_profit, 2),
                gross_margin_pct=assumptions.gross_margin_pct,
                opex=round(total_opex, 2),
                ebitda=round(ebitda, 2),
                headcount=headcount,
                cash_ending=round(current_cash, 2),
                runway_months=runway
            ))

        # Fund Allocation Breakdown
        fund_ask = assumptions.funding_ask
        allocations = [
            {
                "category": "R&D & Engineering",
                "percentage": 45,
                "amount": round(fund_ask * 0.45, 2),
                "description": "Core ML infrastructure, telemetry data pipelines, predictive models, platform security"
            },
            {
                "category": "Go-To-Market & Sales",
                "percentage": 30,
                "amount": round(fund_ask * 0.30, 2),
                "description": "Enterprise sales leads, design partner pilots, developer advocacy, marketing"
            },
            {
                "category": "Cloud & Operations",
                "percentage": 15,
                "amount": round(fund_ask * 0.15, 2),
                "description": "GPU/inference clusters, multi-region database hosting, regulatory compliance certifications"
            },
            {
                "category": "Working Capital & Reserve",
                "percentage": 10,
                "amount": round(fund_ask * 0.10, 2),
                "description": "Legal/IP protection, buffer runway extension for 24-month horizon"
            }
        ]

        market_sizing = FinancialEngine.calculate_market_size(
            market_size or MarketSizeInput(
                tam_customers=50000,
                tam_annual_spend=assumptions.acv,
                sam_reachable_pct=20.0,
                som_penetration_pct=3.5
            )
        )

        return {
            "currency": "USD",
            "starting_cash": assumptions.starting_cash,
            "monthly_burn": assumptions.monthly_burn,
            "funding_ask": assumptions.funding_ask,
            "target_runway_months": assumptions.target_runway_months,
            "calculated_runway_months": calculated_runway,
            "acv": assumptions.acv,
            "gross_margin_pct": assumptions.gross_margin_pct,
            "cac": assumptions.cac,
            "ltv": assumptions.ltv,
            "ltv_cac_ratio": ltv_cac,
            "payback_months": assumptions.payback_months,
            "projections": [p.dict() for p in projections],
            "market_sizing": market_sizing.dict(),
            "fund_allocation": allocations
        }
