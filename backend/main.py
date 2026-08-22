from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta
from jose import jwt, JWTError

import models
import schemas
from database import engine, SessionLocal
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Talaba Chegirmalari API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token yaroqsiz yoki muddati tugagan",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        student_id: str = payload.get("sub")
        if student_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.student_id == student_id).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/signup")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.student_id == user.student_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu talaba ID ro'yxatdan o'tgan!")
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(full_name=user.full_name, student_id=user.student_id, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    return {"message": "Muvaffaqiyatli ro'yxatdan o'tdingiz!"}

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.student_id == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="ID yoki parol xato!")
    access_token = create_access_token(data={"sub": user.student_id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/generate-qr", response_model=schemas.QRResponse)
def generate_discount_qr(request: schemas.QRRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    unique_code = str(uuid.uuid4())
    short_code = str(uuid.uuid4().int)[:6] 
    expires = datetime.utcnow() + timedelta(minutes=5)
    new_discount_code = models.DiscountCode(code=unique_code, short_code=short_code, student_id=current_user.student_id, store_id=request.store_id, expires_at=expires)
    db.add(new_discount_code)
    db.commit()
    return {"success": True, "qr_data": unique_code, "short_code": short_code, "expires_at": expires, "message": "Kod olingan"}

@app.post("/verify-qr")
def verify_discount_qr(request: schemas.VerifyRequest, db: Session = Depends(get_db)):
    discount = db.query(models.DiscountCode).filter(
        (models.DiscountCode.code == request.code) | (models.DiscountCode.short_code == request.code)
    ).first()
    
    if not discount:
        raise HTTPException(status_code=404, detail="Kod topilmadi! Xato kiritilgan.")
    if discount.is_used:
        raise HTTPException(status_code=400, detail="Diqqat! Bu koddan allaqachon foydalanilgan.")
    if discount.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Kodning 5 daqiqalik muddati tugagan!")
        
    discount.is_used = True
    db.commit()
    return {"success": True, "message": "Tasdiqlandi! Talabaga chegirma qo'llang."}