from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Project, PitchDeck, FinancialModel
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/{project_id}/markdown")
async def export_markdown(project_id: str, db: AsyncSession = Depends(get_db)):
    """Exports full 10-slide blueprint as clean Markdown."""
    proj_stmt = select(Project).where(Project.id == project_id)
    p_res = await db.execute(proj_stmt)
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deck_stmt = select(PitchDeck).where(PitchDeck.project_id == project_id)
    d_res = await db.execute(deck_stmt)
    deck = d_res.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="Pitch deck not found")

    md_content = ExportService.export_markdown(project, deck)
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{project.name.replace(" ", "_")}_pitch_blueprint.md"'}
    )


@router.get("/{project_id}/json")
async def export_json(project_id: str, db: AsyncSession = Depends(get_db)):
    """Exports structured pitch blueprint and financial models in JSON."""
    proj_stmt = select(Project).where(Project.id == project_id)
    p_res = await db.execute(proj_stmt)
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deck_stmt = select(PitchDeck).where(PitchDeck.project_id == project_id)
    d_res = await db.execute(deck_stmt)
    deck = d_res.scalar_one_or_none()

    fin_stmt = select(FinancialModel).where(FinancialModel.project_id == project_id)
    f_res = await db.execute(fin_stmt)
    fin = f_res.scalar_one_or_none()

    return ExportService.export_json(project, deck, fin)


@router.get("/{project_id}/pptx")
async def export_pptx(project_id: str, theme: str = "dark", db: AsyncSession = Depends(get_db)):
    """Exports pitch blueprint as an editable 16:9 PowerPoint (.pptx) presentation in light or dark theme."""
    proj_stmt = select(Project).where(Project.id == project_id)
    p_res = await db.execute(proj_stmt)
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deck_stmt = select(PitchDeck).where(PitchDeck.project_id == project_id)
    d_res = await db.execute(deck_stmt)
    deck = d_res.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="Pitch deck not found")

    pptx_stream = ExportService.export_pptx(project, deck, theme=theme)
    theme_suffix = f"_{theme}" if theme else ""
    return StreamingResponse(
        pptx_stream,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f'attachment; filename="{project.name.replace(" ", "_")}_pitch{theme_suffix}.pptx"'}
    )


@router.get("/{project_id}/pdf")
async def export_pdf(project_id: str, db: AsyncSession = Depends(get_db)):
    """Exports pitch blueprint as a printable executive summary PDF."""
    proj_stmt = select(Project).where(Project.id == project_id)
    p_res = await db.execute(proj_stmt)
    project = p_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deck_stmt = select(PitchDeck).where(PitchDeck.project_id == project_id)
    d_res = await db.execute(deck_stmt)
    deck = d_res.scalar_one_or_none()
    if not deck:
        raise HTTPException(status_code=404, detail="Pitch deck not found")

    pdf_stream = ExportService.export_pdf(project, deck)
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{project.name.replace(" ", "_")}_blueprint.pdf"'}
    )
