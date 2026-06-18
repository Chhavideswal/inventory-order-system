import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

logger = logging.getLogger(__name__)

def get_engine():
    retries = 5
    while retries > 0:
        try:
            engine = create_engine(settings.database_url)
            # Try to connect to ensure it's up
            with engine.connect() as conn:
                pass
            return engine
        except Exception as e:
            logger.warning(f"Database connection failed. Retrying in 5 seconds... ({retries} retries left)")
            retries -= 1
            time.sleep(5)
    raise Exception("Could not connect to database after several retries.")

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
