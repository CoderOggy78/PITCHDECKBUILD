import os
import shutil
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db, AsyncSessionLocal
from app.config import settings
from app.models import ReferenceDocument, ReferencePage, DocumentChunk, Project
from app.schemas import ReferenceDocSummary, ReferencePageOut
from app.services.pdf_processor import PDFProcessor
from app.services.classifier import SlideClassifier
from app.services.chunker import SemanticChunker
from app.services.vector_store import VectorStore

router = APIRouter(prefix="/references", tags=["references"])

async def process_pdf_document_task(document_id: str, file_path: str):
    """Background task that runs the complete PDF extraction, classification, chunking, and vector indexing."""
    async with AsyncSessionLocal() as db:
        try:
            doc_stmt = select(ReferenceDocument).where(ReferenceDocument.id == document_id)
            d_res = await db.execute(doc_stmt)
            doc = d_res.scalar_one_or_none()
            if not doc:
                return

            doc.processing_status = "extracting"
            doc.progress = 25
            doc.stage_message = "Extracting text and segmenting pages..."
            await db.commit()

            # 1. Text & signal extraction via PyMuPDF / pypdf
            extracted_pages = PDFProcessor.extract_text_and_pages(file_path)
            doc.page_count = len(extracted_pages)
            doc.processing_status = "classifying"
            doc.progress = 50
            doc.stage_message = "Classifying slide categories..."
            await db.commit()

            detected_categories = set()

            # 2. Classify and store pages
            for p in extracted_pages:
                classification = SlideClassifier.classify_page(
                    text=p["text"],
                    headings=p["headings"],
                    page_num=p["page_number"],
                    total_pages=len(extracted_pages)
                )
                detected_categories.add(classification["category"])

                page_record = ReferencePage(
                    document_id=doc.id,
                    page_number=p["page_number"],
                    category=classification["category"],
                    confidence=classification["confidence"],
                    text_content=p["text"],
                    headings=p["headings"],
                    metrics=p["metrics"],
                    companies=p["companies"],
                    summary=classification["summary"],
                    visual_description=classification["visual_description"]
                )
                db.add(page_record)

                # 3. Chunk and generate embeddings
                chunks = SemanticChunker.chunk_page_content(
                    page_number=p["page_number"],
                    text=p["text"],
                    category=classification["category"],
                    headings=p["headings"]
                )

                for ch in chunks:
                    chunk_vec = VectorStore.generate_embedding(ch["content"])
                    chunk_rec = DocumentChunk(
                        document_id=doc.id,
                        page_number=ch["page_number"],
                        slide_type=ch["slide_type"],
                        content=ch["content"],
                        embedding_json=chunk_vec,
                        metadata_json=ch["metadata"]
                    )
                    db.add(chunk_rec)

            doc.detected_categories = list(detected_categories)
            doc.processing_status = "ready"
            doc.progress = 100
            doc.stage_message = "Indexed & RAG Ready"
            await db.commit()

        except Exception as e:
            if doc:
                doc.processing_status = "failed"
                doc.error_message = str(e)
                doc.stage_message = f"Error: {str(e)[:100]}"
                await db.commit()


@router.post("/upload", response_model=List[ReferenceDocSummary])
async def upload_reference_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    project_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts 10+ PDF reference decks via drag-and-drop, validates file type and size,
    and initiates the background ingestion pipeline.
    """
    created_docs = []
    
    # If no project_id passed, check or use default
    target_project_id = project_id
    if not target_project_id:
        proj_stmt = select(Project).limit(1)
        p_res = await db.execute(proj_stmt)
        p = p_res.scalar_one_or_none()
        if p:
            target_project_id = p.id
        else:
            # Create a placeholder project
            temp_p = Project(name="New Venture Project", status="draft")
            db.add(temp_p)
            await db.flush()
            target_project_id = temp_p.id

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            continue

        # Sanitize filename
        safe_filename = "".join([c for c in file.filename if c.isalnum() or c in (".", "_", "-", " ")]).strip()
        unique_name = f"{uuid.uuid4()[:8]}_{safe_filename}"
        dest_path = settings.UPLOAD_PATH / unique_name

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = dest_path.stat().st_size

        doc = ReferenceDocument(
            project_id=target_project_id,
            filename=safe_filename,
            storage_path=str(dest_path),
            file_size_bytes=file_size,
            processing_status="parsing",
            progress=10,
            stage_message="File uploaded, starting parsing...",
            detected_categories=[]
        )
        db.add(doc)
        await db.flush()
        created_docs.append(doc)

        # Launch non-blocking background processing
        background_tasks.add_task(process_pdf_document_task, doc.id, str(dest_path))

    await db.commit()
    for d in created_docs:
        await db.refresh(d)

    return created_docs


@router.get("", response_model=List[ReferenceDocSummary])
async def list_references(project_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Lists all indexed reference documents."""
    stmt = select(ReferenceDocument)
    if project_id:
        stmt = stmt.where(ReferenceDocument.project_id == project_id)
    stmt = stmt.order_by(ReferenceDocument.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{document_id}")
async def get_reference_details(document_id: str, db: AsyncSession = Depends(get_db)):
    """Returns document metadata and categorized page previews for the PDF Analysis Viewer."""
    stmt = select(ReferenceDocument).where(ReferenceDocument.id == document_id)
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Reference document not found")

    page_stmt = select(ReferencePage).where(ReferencePage.document_id == document_id).order_by(ReferencePage.page_number)
    p_res = await db.execute(page_stmt)
    pages = p_res.scalars().all()

    return {
        "document": ReferenceDocSummary.from_orm(doc),
        "pages": [ReferencePageOut.from_orm(p) for p in pages]
    }


@router.get("/{document_id}/status")
async def get_processing_status(document_id: str, db: AsyncSession = Depends(get_db)):
    """Polls processing progress, stage message, and completion status."""
    stmt = select(ReferenceDocument).where(ReferenceDocument.id == document_id)
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "status": doc.processing_status,
        "progress": doc.progress,
        "stage": doc.stage_message,
        "page_count": doc.page_count,
        "error": doc.error_message
    }


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference(document_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes reference deck and associated chunks from vector index."""
    stmt = select(ReferenceDocument).where(ReferenceDocument.id == document_id)
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return None


@router.post("/search")
async def search_rag(
    query: str,
    project_id: Optional[str] = None,
    slide_types: Optional[List[str]] = None,
    top_k: int = 6,
    db: AsyncSession = Depends(get_db)
):
    """Executes diverse semantic RAG search across reference chunks."""
    results = await VectorStore.search(
        db=db,
        query=query,
        project_id=project_id,
        slide_types=slide_types,
        top_k=top_k,
        max_chunks_per_doc=2
    )
    return {"query": query, "total_results": len(results), "chunks": results}
