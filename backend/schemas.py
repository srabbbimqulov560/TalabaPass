from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    student_id: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class QRRequest(BaseModel):
    store_id: int

class QRResponse(BaseModel):
    success: bool
    qr_data: str
    short_code: str
    expires_at: datetime
    message: str

class VerifyRequest(BaseModel):
    code: str