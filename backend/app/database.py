import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

logger = logging.getLogger(__name__)

engine = None
SessionLocal = None
Base = declarative_base()


def init_db():
    global engine, SessionLocal

    retries = 5
    while retries > 0:
        try:
            engine = create_engine(settings.database_url)

            # test connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")

            SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine
            )

            logger.info("Database connected successfully")
            return

        except Exception:
            logger.warning(
                f"Database connection failed. Retrying... ({retries} retries left)"
            )
            retries -= 1
            time.sleep(5)

    raise Exception("Could not connect to database after several retries.")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
