import pytest
from app.services.financial_engine import FinancialEngine
from app.schemas import MarketSizeInput, FinancialAssumptionsInput

def test_market_size_calculation():
    inp = MarketSizeInput(
        tam_customers=100000,
        tam_annual_spend=20000,
        sam_reachable_pct=25.0,
        som_penetration_pct=4.0
    )
    res = FinancialEngine.calculate_market_size(inp)
    
    assert res.tam_value == 2_000_000_000 # 100k * 20k = $2B
    assert res.sam_value == 500_000_000   # 25% of $2B = $500M
    assert res.som_value == 20_000_000    # 4% of $500M = $20M
    assert "$2.00B" in res.tam_formula or "$2B" in res.tam_formula

def test_financial_projections():
    assumptions = FinancialAssumptionsInput(
        starting_cash=200000.0,
        monthly_burn=30000.0,
        funding_ask=1500000.0,
        acv=30000.0,
        gross_margin_pct=80.0,
        cac=5000.0,
        ltv=90000.0,
        y1_customers=10,
        y2_customers=30,
        y3_customers=80,
        y4_customers=180,
        y5_customers=400
    )
    res = FinancialEngine.calculate_projections(assumptions)
    
    assert len(res["projections"]) == 5
    y1 = res["projections"][0]
    assert y1["revenue"] == 300_000 # 10 * 30k
    assert y1["cogs"] == 60_000     # 20% of 300k
    assert y1["gross_profit"] == 240_000
    assert res["calculated_runway_months"] > 0
    assert res["ltv_cac_ratio"] == 18.0 # 90k / 5k
