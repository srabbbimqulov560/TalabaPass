from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    student_id = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class DiscountCode(Base):
    __tablename__ = "discount_codes"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) 
    short_code = Column(String, index=True) 
    student_id = Column(String, ForeignKey("users.student_id"))
    store_id = Column(Integer)
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)