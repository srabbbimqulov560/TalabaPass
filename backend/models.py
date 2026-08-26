from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

# 1. Talabalar jadvali
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    student_id = Column(String, unique=True, index=True) # HEMIS yoki Talaba ID
    hashed_password = Column(String)

# 2. Chegirmalar jadvali
class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)

# 3. Do'konlar va Xizmatlar jadvali (YANGI)
class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True) # Do'kon turi (O'quv markazi, Kiyim-kechak va h.k)
    name = Column(String, unique=True, index=True) # Do'kon nomi
    description = Column(String) # Qisqa ma'lumot
    logo_url = Column(String, nullable=True) # Profil rasmi
    location = Column(String, nullable=True) # Joylashuv
    username = Column(String, unique=True, index=True) # Tizimga kirish uchun login
    hashed_password = Column(String)
    is_approved = Column(Boolean, default=False) # S-Admin tasdiqlashi uchun
    rating = Column(Float, default=0.0) # O'rtacha reyting yulduzchasi

    # Bitta do'konning ko'plab sharhlari bo'lishi mumkin (aloqa o'rnatish)
    reviews = relationship("Review", back_populates="merchant")

# 4. Sharhlar va Baholar jadvali (YANGI)
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"))
    student_name = Column(String) # Sharh qoldirgan talaba ismi
    rating = Column(Integer) # 1 dan 5 gacha yulduzcha
    comment = Column(String) # Sharh matni

    # Sharh qaysi do'konga tegishli ekanligini bog'lash
    merchant = relationship("Merchant", back_populates="reviews")