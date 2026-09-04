import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    one_liner = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    stage = Column(String(50), nullable=True)
    business_type = Column(String(50), nullable=True)
    customer_geography = Column(String(100), nullable=True)
    target_customer = Column(Text, nullable=True)
    status = Column(String(50), default="draft") # draft, generating, ready, completed
    investor_readiness_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships with eager selectin loading for async SQLAlchemy
    profile = relationship("StartupProfile", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    pitch_deck = relationship("PitchDeck", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    reference_documents = relationship("ReferenceDocument", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    financial_model = relationship("FinancialModel", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    competitors = relationship("Competitor", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    critique_reports = relationship("CritiqueReport", back_populates="project", cascade="all, delete-orphan", lazy="selectin")


class StartupProfile(Base):
    __tablename__ = "startup_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    company = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    stage = Column(String(50), nullable=True)
    geography = Column(String(100), nullable=True)
    customer = Column(Text, nullable=True)
    problem = Column(Text, nullable=True)
    solution = Column(Text, nullable=True)
    value_proposition = Column(Text, nullable=True)
    business_model = Column(Text, nullable=True)
    funding_goal = Column(String(100), nullable=True)
    
    competitors = Column(JSON, default=list)
    traction = Column(JSON, default=dict)
    known_metrics = Column(JSON, default=dict)
    unknown_fields = Column(JSON, default=list)
    assumptions = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="profile")


class PitchDeck(Base):
    __tablename__ = "pitch_decks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    title = Column(String(255), default="Investor Pitch Blueprint")
    version = Column(Integer, default=1)
    status = Column(String(50), default="ready")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="pitch_deck")
    slides = relationship("PitchSlide", back_populates="deck", cascade="all, delete-orphan", order_by="PitchSlide.slide_number", lazy="selectin")


class PitchSlide(Base):
    __tablename__ = "pitch_slides"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    deck_id = Column(String(36), ForeignKey("pitch_decks.id", ondelete="CASCADE"), nullable=False)
    slide_number = Column(Integer, nullable=False)
    slide_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    headline = Column(Text, nullable=False)
    objective = Column(Text, nullable=True)
    narrative = Column(Text, nullable=False)
    key_points = Column(JSON, default=list)
    metrics = Column(JSON, default=list)
    assumptions = Column(JSON, default=list)
    missing_information = Column(JSON, default=list)
    risks = Column(JSON, default=list)
    supporting_evidence = Column(JSON, default=list)
    reference_patterns = Column(JSON, default=list)
    citations = Column(JSON, default=list)
    visual_recommendation = Column(Text, nullable=True)
    visual_type = Column(String(100), nullable=True)
    visual_data = Column(JSON, default=dict)
    investor_question = Column(Text, nullable=True)
    speaker_notes = Column(Text, nullable=True)
    completeness_score = Column(Float, default=80.0)
    claims = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    deck = relationship("PitchDeck", back_populates="slides")


class ReferenceDocument(Base):
    __tablename__ = "reference_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    page_count = Column(Integer, default=0)
    industry = Column(String(100), nullable=True)
    processing_status = Column(String(50), default="uploading")
    progress = Column(Integer, default=0)
    stage_message = Column(String(255), default="Uploaded")
    error_message = Column(Text, nullable=True)
    detected_categories = Column(JSON, default=list)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="reference_documents")
    pages = relationship("ReferencePage", back_populates="document", cascade="all, delete-orphan", order_by="ReferencePage.page_number", lazy="selectin")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", lazy="selectin")


class ReferencePage(Base):
    __tablename__ = "reference_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("reference_documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    category = Column(String(50), default="other")
    confidence = Column(Float, default=0.0)
    text_content = Column(Text, default="")
    headings = Column(JSON, default=list)
    metrics = Column(JSON, default=list)
    companies = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    visual_description = Column(Text, nullable=True)
    
    document = relationship("ReferenceDocument", back_populates="pages")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("reference_documents.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    slide_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)

    document = relationship("ReferenceDocument", back_populates="chunks")


class FinancialModel(Base):
    __tablename__ = "financial_models"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    currency = Column(String(10), default="USD")
    starting_cash = Column(Float, default=150000.0)
    monthly_burn = Column(Float, default=25000.0)
    funding_ask = Column(Float, default=2000000.0)
    target_runway_months = Column(Integer, default=24)
    
    tam_customers = Column(Float, default=50000.0)
    tam_annual_spend = Column(Float, default=24000.0)
    sam_reachable_pct = Column(Float, default=20.0)
    som_penetration_pct = Column(Float, default=3.5)
    
    acv = Column(Float, default=24000.0)
    gross_margin_pct = Column(Float, default=82.0)
    cac = Column(Float, default=4500.0)
    ltv = Column(Float, default=72000.0)
    payback_months = Column(Float, default=6.5)
    
    projections = Column(JSON, default=list)
    market_sizing = Column(JSON, default=dict)
    fund_allocation = Column(JSON, default=list)
    
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="financial_model")


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), default="Direct")
    target_customer = Column(String(255), nullable=True)
    pricing = Column(String(100), nullable=True)
    strength = Column(Text, nullable=True)
    weakness = Column(Text, nullable=True)
    differentiator = Column(Text, nullable=True)
    our_advantage = Column(Text, nullable=True)
    
    project = relationship("Project", back_populates="competitors")


class CritiqueReport(Base):
    __tablename__ = "critique_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    readiness_score = Column(Float, default=75.0)
    scores = Column(JSON, default=dict)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    red_flags = Column(JSON, default=list)
    vc_tough_questions = Column(JSON, default=list)
    consistency_issues = Column(JSON, default=list)
    consistency_score = Column(Float, default=85.0)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="critique_reports")
