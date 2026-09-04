from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Project, PitchDeck, StartupProfile, FinancialModel, ReferenceDocument
from app.schemas import (
    StartupIntakeCreate,
    ProjectSummary,
    PitchDeckOut,
    RedTeamResponse,
    ConsistencyCheckResponse
)
from app.services.orchestrator import GenerationOrchestrator
from app.services.red_team import RedTeamEngine
from app.services.consistency_engine import ConsistencyEngine
from app.services.pattern_engine import PatternEngine

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=List[ProjectSummary])
async def list_projects(db: AsyncSession = Depends(get_db)):
    """Lists all startup projects with readiness scores and metadata for dashboard."""
    stmt = select(Project).order_by(Project.updated_at.desc())
    result = await db.execute(stmt)
    projects = result.scalars().all()
    
    summaries = []
    for p in projects:
        # Count indexed reference decks
        ref_stmt = select(ReferenceDocument).where(ReferenceDocument.project_id == p.id)
        ref_res = await db.execute(ref_stmt)
        docs = ref_res.scalars().all()
        
        summaries.append(ProjectSummary(
            id=p.id,
            name=p.name,
            one_liner=p.one_liner,
            industry=p.industry,
            stage=p.stage,
            status=p.status,
            investor_readiness_score=p.investor_readiness_score or 75.0,
            slide_count=10,
            decks_indexed=len(docs),
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
    return summaries


@router.post("", response_model=ProjectSummary, status_code=status.HTTP_201_CREATED)
async def create_project_and_generate(intake: StartupIntakeCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new startup project and triggers the generation orchestrator."""
    project = Project(
        name=intake.name,
        one_liner=intake.one_liner,
        description=intake.description,
        industry=intake.industry,
        stage=intake.stage,
        business_type=intake.business_type,
        customer_geography=intake.customer_geography,
        target_customer=intake.target_customer,
        status="generating",
        investor_readiness_score=80.0
    )
    db.add(project)
    await db.flush()

    # Link any reference documents uploaded prior to project creation
    if intake.reference_document_ids:
        for doc_id in intake.reference_document_ids:
            doc_stmt = select(ReferenceDocument).where(ReferenceDocument.id == doc_id)
            d_res = await db.execute(doc_stmt)
            doc = d_res.scalar_one_or_none()
            if doc:
                doc.project_id = project.id

    # Generate complete pitch blueprint
    await GenerationOrchestrator.build_complete_pitch(db, project, intake)
    await db.commit()
    await db.refresh(project)

    return ProjectSummary(
        id=project.id,
        name=project.name,
        one_liner=project.one_liner,
        industry=project.industry,
        stage=project.stage,
        status=project.status,
        investor_readiness_score=project.investor_readiness_score,
        slide_count=10,
        decks_indexed=len(intake.reference_document_ids or []),
        created_at=project.created_at,
        updated_at=project.updated_at
    )


@router.get("/{project_id}")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves full startup project profile and deck status."""
    stmt = select(Project).where(Project.id == project_id)
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    prof_stmt = select(StartupProfile).where(StartupProfile.project_id == project_id)
    prof_res = await db.execute(prof_stmt)
    profile = prof_res.scalar_one_or_none()

    return {
        "id": project.id,
        "name": project.name,
        "one_liner": project.one_liner,
        "description": project.description,
        "industry": project.industry,
        "stage": project.stage,
        "business_type": project.business_type,
        "customer_geography": project.customer_geography,
        "target_customer": project.target_customer,
        "status": project.status,
        "investor_readiness_score": project.investor_readiness_score,
        "profile": {
            "value_proposition": profile.value_proposition if profile else "",
            "business_model": profile.business_model if profile else "",
            "funding_goal": profile.funding_goal if profile else "",
            "known_metrics": profile.known_metrics if profile else {},
            "assumptions": profile.assumptions if profile else [],
            "unknown_fields": profile.unknown_fields if profile else []
        } if profile else None,
        "created_at": project.created_at,
        "updated_at": project.updated_at
    }


@router.get("/{project_id}/pitch", response_model=PitchDeckOut)
async def get_pitch_deck(project_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves the full 10-slide pitch blueprint for the blueprint editor."""
    stmt = select(PitchDeck).where(PitchDeck.project_id == project_id)
    res = await db.execute(stmt)
    deck = res.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="Pitch deck not found for this project")

    # Order slides by slide_number
    deck.slides.sort(key=lambda s: s.slide_number)
    return deck


@router.post("/{project_id}/generate", response_model=PitchDeckOut)
async def regenerate_pitch(project_id: str, intake: Optional[StartupIntakeCreate] = None, db: AsyncSession = Depends(get_db)):
    """Regenerates the complete 10-slide blueprint for a project."""
    stmt = select(Project).where(Project.id == project_id)
    res = await db.execute(stmt)
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not intake:
        intake = StartupIntakeCreate(
            name=project.name,
            one_liner=project.one_liner or "",
            description=project.description or "",
            target_customer=project.target_customer or "Enterprise",
            industry=project.industry or "DeepTech",
            stage=project.stage or "MVP"
        )

    deck = await GenerationOrchestrator.build_complete_pitch(db, project, intake)
    return deck


@router.get("/{project_id}/intelligence")
async def get_project_intelligence(project_id: str, db: AsyncSession = Depends(get_db)):
    """Returns collective reference deck patterns and venture insights."""
    return await PatternEngine.analyze_project_references(db, project_id)


@router.post("/{project_id}/investor-red-team", response_model=RedTeamResponse)
async def run_investor_red_team(project_id: str, db: AsyncSession = Depends(get_db)):
    """Runs a 10-dimension Investor Red Team evaluation on the deck."""
    return await RedTeamEngine.evaluate_project(db, project_id)


@router.post("/{project_id}/consistency-check", response_model=ConsistencyCheckResponse)
async def run_consistency_check(project_id: str, db: AsyncSession = Depends(get_db)):
    """Validates cross-slide consistency across ICP, pricing, GTM, and runway math."""
    return await ConsistencyEngine.validate_deck(db, project_id)
