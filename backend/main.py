from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

import models
from database import engine, get_db

# Ma'lumotlar bazasidagi jadvallarni yaratish
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalabaPass API")

# Brauzer so'rovlarini o'tkazish uchun ruxsatnoma (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
#      XAVFSIZLIK VA TOKEN SOZLAMALARI
# ==========================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "talabapass_super_maxfiy_kalit"
ALGORITHM = "HS256"

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7) # Token 7 kun yashaydi
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==========================================
#     PYDANTIC MODELLAR (Ma'lumotlar uchun)
# ==========================================
class StudentCreate(BaseModel):
    full_name: str
    student_id: str
    password: str

class QRVerify(BaseModel):
    code: str

class MerchantCreate(BaseModel):
    category: str
    name: str
    description: str
    username: str
    password: str


# ==========================================
#          TALABALAR UCHUN API'LAR
# ==========================================

@app.post("/signup")
def signup(student: StudentCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.Student).filter(models.Student.student_id == student.student_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu ID band")
    
    hashed_pw = get_password_hash(student.password)
    new_student = models.Student(
        full_name=student.full_name,
        student_id=student.student_id,
        hashed_password=hashed_pw
    )
    db.add(new_student)
    db.commit()
    return {"message": "Muvaffaqiyatli ro'yxatdan o'tdingiz"}

@app.post("/login")
def login(req: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # req.username ichida talaba ID si keladi
    user = db.query(models.Student).filter(models.Student.student_id == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="ID yoki parol xato")
    
    token = create_access_token({"sub": user.student_id, "role": "student", "name": user.full_name})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/verify-qr")
def verify_qr(req: QRVerify, db: Session = Depends(get_db)):
    if not req.code:
        raise HTTPException(status_code=400, detail="QR kod noto'g'ri yoki yaroqsiz")
    return {"status": "success", "message": "Chegirma tasdiqlandi!"}

# ⭐️ YANGI: Talabalar uchun tasdiqlangan xizmatlarni (do'konlarni) ko'rsatish
@app.get("/services")
def get_services(db: Session = Depends(get_db)):
    # Faqat is_approved = True bo'lgan do'konlarni qaytaradi
    return db.query(models.Merchant).filter(models.Merchant.is_approved == True).all()


# ==========================================
#         DO'KONLAR UCHUN API'LAR
# ==========================================

# 1. Do'kon nomi band yoki yo'qligini tekshirish API
@app.get("/check-merchant-name/{name}")
def check_merchant_name(name: str, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.name.ilike(name)).first()
    if merchant:
        return {"is_available": False, "message": "Bu nom band"}
    return {"is_available": True, "message": "Nom bo'sh"}

# 2. Do'konni ro'yxatdan o'tkazish API (Arizani yuborish)
@app.post("/register-merchant")
def register_merchant(merchant: MerchantCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.Merchant).filter(models.Merchant.username == merchant.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu login band")

    hashed_pw = get_password_hash(merchant.password)
    new_merchant = models.Merchant(
        category=merchant.category,
        name=merchant.name,
        description=merchant.description,
        username=merchant.username,
        hashed_password=hashed_pw,
        is_approved=False # S-Admin tasdiqlashi shart
    )
    db.add(new_merchant)
    db.commit()
    
    return {"message": "Do'kon muvaffaqiyatli ro'yxatdan o'tdi. Admin tasdiqlashi kutilmoqda."}

# ⭐️ YANGI: Do'konlar uchun Login API
@app.post("/merchant-login")
def merchant_login(req: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.username == req.username).first()
    
    if not merchant or not verify_password(req.password, merchant.hashed_password):
        raise HTTPException(status_code=400, detail="Login yoki parol xato")
    
    # Agar S-Admin hali tasdiqlamagan bo'lsa, tizimga kirgizmang
    if not merchant.is_approved:
        raise HTTPException(status_code=403, detail="Arizangiz ko'rib chiqilmoqda. Hali tasdiqlanmadi.")
        
    token = create_access_token({"sub": merchant.username, "role": "merchant", "id": merchant.id})
    return {"access_token": token, "token_type": "bearer", "merchant_name": merchant.name}


# ==========================================
#         SUPER-ADMIN UCHUN API'LAR
# ==========================================

# 1. Kutilayotgan (tasdiqlanmagan) do'konlar ro'yxatini ko'rish
@app.get("/admin/pending-merchants")
def get_pending_merchants(db: Session = Depends(get_db)):
    pending_merchants = db.query(models.Merchant).filter(models.Merchant.is_approved == False).all()
    return pending_merchants

# 2. Do'konni tasdiqlash (Ruxsat berish)
@app.put("/admin/approve-merchant/{merchant_id}")
def approve_merchant(merchant_id: int, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    
    if not merchant:
        raise HTTPException(status_code=404, detail="Do'kon topilmadi")
    
    merchant.is_approved = True
    db.commit()
    return {"status": "success", "message": f"'{merchant.name}' muvaffaqiyatli tasdiqlandi!"}

# 3. Do'konni rad etish (Bazadan o'chirib yuborish)
@app.delete("/admin/reject-merchant/{merchant_id}")
def reject_merchant(merchant_id: int, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    
    if not merchant:
        raise HTTPException(status_code=404, detail="Do'kon topilmadi")
    
    db.delete(merchant)
    db.commit()
    return {"status": "success", "message": f"'{merchant.name}' rad etildi va o'chirildi."}