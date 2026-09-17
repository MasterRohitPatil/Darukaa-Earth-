import json
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Text, Float, Integer, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# SQLite configuration with check_same_thread=False for FastAPI
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
