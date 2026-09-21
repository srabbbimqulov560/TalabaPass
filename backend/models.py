from sqlalchemy import Boolean, Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True) # Integer emas, String bo'lishi shart!
    first_name = Column(String)
    last_name = Column(String)
    student_id = Column(String, unique=True, index=True) 
    university = Column(String)
    is_active = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True) # Integer emas, String bo'lishi shart!
    category = Column(String, index=True) 
    name = Column(String, unique=True, index=True) 
    description = Column(String) 
    logo_url = Column(String, nullable=True) 
    discount_percent = Column(Float, default=0.0) 
    is_active = Column(Boolean, default=False) # is_approved o'rniga is_active qildik

class ScanHistory(Base):
    __tablename__ = "scan_history"
    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"))
    student_id = Column(String, ForeignKey("students.id"))