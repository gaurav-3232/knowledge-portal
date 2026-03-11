import os
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "knowledge_portal")
DB_USER = os.getenv("DB_USER", "kp_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "kp_password")

DB_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

engine = create_engine(DB_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def wait_for_db(retries: int = 30, delay: int = 2) -> None:
    """Block until MySQL accepts connections. Essential for Docker startup."""
    for attempt in range(1, retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[db] Connected on attempt {attempt}")
            return
        except Exception as exc:
            print(f"[db] Attempt {attempt}/{retries} — {exc}")
            time.sleep(delay)
    raise RuntimeError("Could not connect to MySQL after multiple retries")
