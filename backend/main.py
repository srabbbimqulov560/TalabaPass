from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import JWTError, jwt

import models
from database import engine, get_db

# Bazani sinxronlash
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalabaPass API - Secure")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
#      🛡️ XAVFSIZLIK QOROVULLARI (MIDDLEWARES)
# ==========================================
security = HTTPBearer()

# 🔴 DIQQAT: Supabase Settings -> API -> JWT Secret kalitini shu yerga yozing!
SUPABASE_JWT_SECRET = "SIZNING_SUPABASE_JWT_SECRET_KALITINGIZ"

# 1. Supabase tokenini tekshirish
def verify_supabase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        # Supabase tokeni HS256 algoritmi va "authenticated" qatorida keladi
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload 
    except JWTError:
        raise HTTPException(status_code=401, detail="Yaroqsiz yoki muddati tugagan Supabase tokeni")

# 2. Do'kon (Merchant) ruxsatini tekshirish
def verify_merchant(payload: dict = Depends(verify_supabase_token), db: Session = Depends(get_db)):
    user_id = payload.get("sub") # Token ichidagi ID
    merchant = db.query(models.Merchant).filter(models.Merchant.id == user_id).first()
    
    if not merchant or not merchant.is_active:
        raise HTTPException(status_code=403, detail="Ruxsat rad etildi! Siz tasdiqlangan do'kon emassiz.")
    return merchant

# 3. Super-Admin ruxsatini tekshirish
def verify_admin(payload: dict = Depends(verify_supabase_token)):
    user_email = payload.get("email")
    # 🔴 O'zingizning admin emaillingizni yozing:
    if user_email != "admin@talabapass.uz": 
        raise HTTPException(status_code=403, detail="Ruxsat rad etildi! Faqat Admin kirishi mumkin.")
    return payload


# ==========================================
#              API MARSHRUTLARI
# ==========================================

class QRVerify(BaseModel):
    code: str

# KASSIR API: Kassir tasdiqlangan do'kon bo'lsagina ishlaydi
@app.post("/verify-qr")
def verify_qr(req: QRVerify, current_merchant = Depends(verify_merchant), db: Session = Depends(get_db)):
    if not req.code:
        raise HTTPException(status_code=400, detail="QR kod yaroqsiz")
    # BU YERDA 6 xonali kodni tekshirish mantiqi ketadi
    return {"status": "success", "message": "Chegirma muvaffaqiyatli tasdiqlandi!"}

# ADMIN API: Faqat Admin bo'lsagina kiritadi
@app.get("/admin/pending-merchants")
def get_pending_merchants(admin = Depends(verify_admin), db: Session = Depends(get_db)):
    return db.query(models.Merchant).filter(models.Merchant.is_active == False).all()

@app.put("/admin/approve-merchant/{merchant_id}")
def approve_merchant(merchant_id: str, admin = Depends(verify_admin), db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Do'kon topilmadi")
    
    merchant.is_active = True
    db.commit()
    return {"status": "success", "message": f"'{merchant.name}' tasdiqlandi!"}

@app.delete("/admin/reject-merchant/{merchant_id}")
def reject_merchant(merchant_id: str, admin = Depends(verify_admin), db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Do'kon topilmadi")
    
    db.delete(merchant)
    db.commit()
    return {"status": "success", "message": "Arizasi rad etildi va o'chirildi."}