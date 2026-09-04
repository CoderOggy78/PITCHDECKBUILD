from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import FinancialModel, Competitor, Project, ReferenceDocument
from app.schemas import (
    FinancialAssumptionsInput,
    MarketSizeInput,
    FinancialModelOutput,
    CompetitorCreate,
    CompetitorOut,
    ReferenceIntelligenceSummary
)
from app.services.financial_engine import FinancialEngine
from app.services.pattern_engine import PatternEngine

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/financial/{project_id}")
async def get_financial_model(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves deterministic 5-year financial projections and market sizing."""
    stmt = select(FinancialModel).where(FinancialModel.project_id == project_id)
    res = await db.execute(stmt)
    model = res.scalar_one_or_none()
    
    if not model:
        # Generate default model if missing
        calc = FinancialEngine.calculate_projections(
            FinancialAssumptionsInput(),
            MarketSizeInput()
        )
        model = FinancialModel(
            project_id=project_id,
            projections=calc["projections"],
            market_sizing=calc["market_sizing"],
            fund_allocation=calc["fund_allocation"]
        )
        db.add(model)
        await db.commit()
        await db.refresh(model)

    return {
        "id": model.id,
        "project_id": model.project_id,
        "currency": model.currency or "USD",
        "starting_cash": model.starting_cash,
        "monthly_burn": model.monthly_burn,
        "funding_ask": model.funding_ask,
        "target_runway_months": model.target_runway_months,
        "calculated_runway_months": round((model.starting_cash + model.funding_ask) / max(model.monthly_burn, 1.0), 1),
        "acv": model.acv,
        "gross_margin_pct": model.gross_margin_pct,
        "cac": model.cac,
        "ltv": model.ltv,
        "ltv_cac_ratio": round(model.ltv / max(model.cac, 1.0), 2) if model.cac > 0 else 5.0,
        "payback_months": model.payback_months,
        "projections": model.projections or [],
        "market_sizing": model.market_sizing or {},
        "fund_allocation": model.fund_allocation or []
    }


@router.put("/financial/{project_id}")
async def update_financial_model(
    project_id: str,
    assumptions: FinancialAssumptionsInput,
    market_size: MarketSizeInput = None,
    db: AsyncSession = Depends(get_db)
):
    """Updates financial and market assumptions and automatically recalculates 5-year model."""
    stmt = select(FinancialModel).where(FinancialModel.project_id == project_id)
    res = await db.execute(stmt)
    model = res.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Financial model not found")

    calc = FinancialEngine.calculate_projections(assumptions, market_size)

    model.starting_cash = assumptions.starting_cash
    model.monthly_burn = assumptions.monthly_burn
    model.funding_ask = assumptions.funding_ask
    model.target_runway_months = assumptions.target_runway_months
    model.acv = assumptions.acv
    model.gross_margin_pct = assumptions.gross_margin_pct
    model.cac = assumptions.cac
    model.ltv = assumptions.ltv
    model.payback_months = assumptions.payback_months
    model.projections = calc["projections"]
    model.market_sizing = calc["market_sizing"]
    model.fund_allocation = calc["fund_allocation"]

    if market_size:
        model.tam_customers = market_size.tam_customers
        model.tam_annual_spend = market_size.tam_annual_spend
        model.sam_reachable_pct = market_size.sam_reachable_pct
        model.som_penetration_pct = market_size.som_penetration_pct

    await db.commit()
    await db.refresh(model)

    return {
        "id": model.id,
        "project_id": model.project_id,
        "currency": model.currency or "USD",
        "starting_cash": model.starting_cash,
        "monthly_burn": model.monthly_burn,
        "funding_ask": model.funding_ask,
        "target_runway_months": model.target_runway_months,
        "calculated_runway_months": round((model.starting_cash + model.funding_ask) / max(model.monthly_burn, 1.0), 1),
        "acv": model.acv,
        "gross_margin_pct": model.gross_margin_pct,
        "cac": model.cac,
        "ltv": model.ltv,
        "ltv_cac_ratio": round(model.ltv / max(model.cac, 1.0), 2),
        "payback_months": model.payback_months,
        "projections": model.projections,
        "market_sizing": model.market_sizing,
        "fund_allocation": model.fund_allocation
    }


@router.get("/competitors/{project_id}", response_model=List[CompetitorOut])
async def get_competitors(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves competitor matrix for a project."""
    stmt = select(Competitor).where(Competitor.project_id == project_id)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/competitors/{project_id}", response_model=CompetitorOut, status_code=status.HTTP_201_CREATED)
async def add_competitor(project_id: str, comp: CompetitorCreate, db: AsyncSession = Depends(get_db)):
    """Adds a competitor to the comparison matrix."""
    new_comp = Competitor(
        project_id=project_id,
        name=comp.name,
        category=comp.category,
        target_customer=comp.target_customer,
        pricing=comp.pricing,
        strength=comp.strength,
        weakness=comp.weakness,
        differentiator=comp.differentiator,
        our_advantage=comp.our_advantage
    )
    db.add(new_comp)
    await db.commit()
    await db.refresh(new_comp)
    return new_comp


@router.delete("/competitors/{competitor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_competitor(competitor_id: str, db: AsyncSession = Depends(get_db)):
    """Removes a competitor from the comparison matrix."""
    stmt = select(Competitor).where(Competitor.id == competitor_id)
    res = await db.execute(stmt)
    comp = res.scalar_one_or_none()
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor not found")
    await db.delete(comp)
    await db.commit()
    return None


@router.get("/knowledge", response_model=ReferenceIntelligenceSummary)
async def get_knowledge_base_analytics(db: AsyncSession = Depends(get_db)):
    """Aggregates knowledge analytics across all indexed pitch decks in the platform."""
    return await PatternEngine.analyze_project_references(db, project_id=None)
