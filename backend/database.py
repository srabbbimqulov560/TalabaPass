from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ma'lumotlar bazasi fayli nomi
SQLALCHEMY_DATABASE_URL = "sqlite:///./student_discount.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# MANA SHU FUNKSIYA YETISHMAYOTGAN EDI:
# Har bir API so'rov uchun bazaga ulanishni ochadi va yopadi
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()