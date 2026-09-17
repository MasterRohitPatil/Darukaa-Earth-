import json
from datetime import datetime, UTC
from sqlalchemy import Column, String, Text, Float, Integer, DateTime
from app.models.database import Base

class SessionEntity(Base):
    __tablename__ = "sessions"
    
    session_id = Column(String(64), primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

class EnvironmentalStateEntity(Base):
    __tablename__ = "environmental_states"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(64), index=True, nullable=False)
    state_json = Column(Text, nullable=False)
    completeness_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

class ChatMessageEntity(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(64), index=True, nullable=False)
    role = Column(String(16), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    structured_payload = Column(Text, nullable=True)  # JSON string for recommendation/state if applicable
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

class ScientificEvidenceEntity(Base):
    __tablename__ = "scientific_evidence"
    
    id = Column(String(128), primary_key=True, index=True)
    title = Column(String(512), nullable=False)
    source_organization = Column(String(128), nullable=False, index=True)
    year = Column(Integer, nullable=False)
    topic = Column(String(128), nullable=False, index=True)
    intervention = Column(String(128), nullable=False, index=True)
    ecosystem = Column(String(128), nullable=False, index=True)
    evidence_strength = Column(String(32), nullable=False)
    time_horizon = Column(String(32), nullable=False)
    variables_json = Column(Text, nullable=False)  # JSON array of strings
    mechanism = Column(Text, nullable=False)
    effect_direction_json = Column(Text, nullable=False)  # JSON dict
    text = Column(Text, nullable=False)
    source_url = Column(String(512), nullable=False)
    doi = Column(String(128), nullable=True)
