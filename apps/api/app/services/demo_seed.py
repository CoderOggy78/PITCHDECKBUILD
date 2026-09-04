import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    Project,
    StartupProfile,
    PitchDeck,
    PitchSlide,
    ReferenceDocument,
    ReferencePage,
    DocumentChunk,
    FinancialModel,
    Competitor,
    CritiqueReport
)
from app.schemas import StartupIntakeCreate
from app.services.vector_store import VectorStore
from app.services.orchestrator import GenerationOrchestrator

async def seed_demo_data(db: AsyncSession):
    """
    Seeds the platform with the complete, highly realistic AquaSentinel AI demo project,
    pre-indexed synthetic reference pitch decks, and RAG vectors.
    """
    # Check if demo project already exists
    stmt = select(Project).where(Project.name == "AquaSentinel AI")
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        return existing

    demo_project = Project(
        name="AquaSentinel AI",
        one_liner="Predictive intelligence for municipal water networks detecting catastrophic leaks 14 days before failure.",
        description="AquaSentinel AI combines multi-modal acoustic sensors, satellite soil moisture telemetry, and hydraulic SCADA physics models to predict pipeline bursts and infrastructure leakage. We reduce water loss by 78% and eliminate million-dollar emergency repairs for municipal water utilities.",
        industry="ClimateTech / Infrastructure AI",
        stage="MVP",
        business_type="B2B & B2G Enterprise",
        customer_geography="North America & EU",
        target_customer="Municipal Water Utilities & Infrastructure Operators",
        status="ready",
        investor_readiness_score=84.5
    )
    db.add(demo_project)
    await db.flush()

    # Create Synthetic Reference Documents (12 Decks as in Venture Benchmarks)
    sample_decks = [
        ("AquaVenture_SeriesA_Deck.pdf", "ClimateTech / Water", 14),
        ("Siren_Infrastructure_Seed.pdf", "Infrastructure AI", 12),
        ("GridSentinel_SeriesA.pdf", "Energy / Telemetry", 16),
        ("UrbanFlow_PitchDeck.pdf", "Smart Cities", 11),
        ("HydroLogic_Investor_Deck.pdf", "Water Analytics", 13),
        ("PipeMetrics_Seed_Round.pdf", "Sensor IoT", 10),
        ("AeroLeak_Defense_Deck.pdf", "DeepTech", 15),
        ("UtilityAI_Enterprise_Pitch.pdf", "GovTech SaaS", 12),
        ("TerraFlow_SeriesSeed.pdf", "Climate Infrastructure", 14),
        ("Veridia_Water_Intelligence.pdf", "CleanTech", 12),
        ("OmniGrid_AI_Deck.pdf", "Industrial IoT", 13),
        ("Aquifer_Predictive_Pitch.pdf", "Water Utilities", 12),
    ]

    for filename, industry_tag, page_count in sample_decks:
        doc = ReferenceDocument(
            project_id=demo_project.id,
            filename=filename,
            storage_path=f"/demo/references/{filename}",
            file_size_bytes=2_450_000,
            page_count=page_count,
            industry=industry_tag,
            processing_status="ready",
            progress=100,
            stage_message="Fully Indexed (pgvector RAG ready)",
            detected_categories=["problem", "solution", "market", "business_model", "competition", "traction", "gtm", "team", "financials", "funding"],
            metadata_json={"source": "Synthetic Benchmark Library", "verified": True}
        )
        db.add(doc)
        await db.flush()

        # Seed realistic pages and semantic vector chunks for each deck
        page_templates = [
            (1, "problem", f"Municipal water utilities lose 20-30% of treated water (Non-Revenue Water) to undetected sub-surface leaks, costing $14.2B annually. Legacy acoustic sensors generate high false-positives.", ["The Non-Revenue Water Crisis", "Cost of Silent Leaks"]),
            (2, "solution", f"Predictive Physics AI ingests acoustic and SCADA telemetry to detect pipe wall thinning and micro-vibrations 14 days before bursts occur.", ["Autonomous Acoustic Anomaly Core", "Zero Hardware Lock-In"]),
            (3, "tam_sam_som", f"Global water infrastructure monitoring market is $14.4B (300k utility networks @ $48k/yr). SAM is $2.88B across North America and Western Europe.", ["Bottom-Up Sizing", "300,000 Global Utilities"]),
            (4, "business_model", f"Tiered annual SaaS subscription based on monitored pipeline miles ($24k - $120k/yr). 82% software gross margin with 135% net revenue retention.", ["Predictable Recurring SaaS", "Expansion Flywheel"]),
            (5, "competition", f"Legacy SCADA vendors (Siemens, Schneider) are hardware-locked and purely reactive. AquaSentinel provides hardware-agnostic 14-day advance predictions.", ["Competitive Quadrant", "Physics Moat"]),
            (6, "gtm", f"Land-and-expand motion: 30-day $25k diagnostic pilot in high-risk zones, expanding to utility-wide deployment. Channel partnership with civil engineering firms.", ["GTM Roadmap", "Engineering Channel Alliances"]),
            (7, "team", f"Founding team combines 25+ years in utility operations, PhD machine learning researchers, and former VP of Enterprise Infrastructure.", ["Leadership Pedigree", "Advisory Board"]),
            (8, "financials", f"Targeting $15.6M ARR in Year 5 with 650 enterprise utility customers and $3.8M EBITDA.", ["5-Year Projections", "Cash Flow Breakeven at Month 38"]),
            (9, "traction", f"3 deployed municipal utility pilots in California and Texas. 250M telemetry events ingested with 94.2% precision.", ["Live Pilot Validation", "LOI Pipeline"]),
            (10, "funding", f"Raising $2,000,000 Seed round to fund 24 months of runway, scale direct sales, and achieve $2.0M ARR.", ["Seed Round Ask", "Milestone Unlocks"])
        ]

        for p_num, cat, p_text, headings in page_templates:
            ref_page = ReferencePage(
                document_id=doc.id,
                page_number=p_num,
                category=cat,
                confidence=0.92,
                text_content=p_text,
                headings=headings,
                metrics=[{"type": "currency", "value": "$14.2B"}, {"type": "percentage", "value": "78%"}],
                companies=["Siemens", "Schneider Electric", "Badger Meter"],
                summary=f"Key {cat.title()} slide for {filename}",
                visual_description=f"Standard venture layout for {cat}"
            )
            db.add(ref_page)

            # Generate semantic chunk with dense embedding
            chunk_vec = VectorStore.generate_embedding(f"{headings} {p_text}")
            chunk = DocumentChunk(
                document_id=doc.id,
                page_number=p_num,
                slide_type=cat,
                content=f"[{' | '.join(headings)}] {p_text}",
                embedding_json=chunk_vec,
                metadata_json={"document_name": filename, "page_number": p_num, "category": cat}
            )
            db.add(chunk)

    await db.flush()

    # Generate full pitch blueprint for AquaSentinel AI
    intake = StartupIntakeCreate(
        name="AquaSentinel AI",
        one_liner="Predictive intelligence for municipal water networks detecting catastrophic leaks 14 days before failure.",
        description="AquaSentinel AI combines multi-modal acoustic sensors, satellite soil moisture telemetry, and hydraulic SCADA physics models to predict pipeline bursts and infrastructure leakage. We reduce water loss by 78% and eliminate million-dollar emergency repairs for municipal water utilities.",
        target_customer="Municipal Water Utilities & Infrastructure Operators",
        business_type="B2B & B2G Enterprise",
        customer_geography="North America & EU",
        industry="ClimateTech / Infrastructure AI",
        stage="MVP",
        monetization_model="Tiered Enterprise SaaS ($24k - $120k/yr)",
        known_competitors="Siemens, Schneider Electric, Badger Meter, Manual Acoustic Audits",
        traction_details="3 active design partner pilots in California and Texas, $1.8M LOI pipeline value, 250M telemetry events processed",
        team_details="CEO ex-infrastructure operator, CTO PhD in distributed sensor physics, Advisory Board former regional water commissioner",
        funding_required="$2,000,000 Seed"
    )

    await GenerationOrchestrator.build_complete_pitch(db, demo_project, intake)
    await db.commit()
    return demo_project
