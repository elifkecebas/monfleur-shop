from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import hashlib

from database import get_session, init_db, Flower as FlowerDB, ContactMessage as ContactMessageDB

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = hashlib.sha256("monfleur325".encode()).hexdigest()
active_sessions = set()

class AdminLogin(BaseModel):
    username: str
    password: str

class Flower(BaseModel):
    id: str
    name: str
    price: str
    image: str
    category: str
    created_at: datetime

class FlowerCreate(BaseModel):
    name: str
    price: str
    image: str
    category: str

class FlowerUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None

class ContactMessage(BaseModel):
    id: str
    name: str
    email: str
    message: str
    created_at: datetime

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    message: str

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token not in active_sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return token

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    password_hash = hashlib.sha256(credentials.password.encode()).hexdigest()
    if credentials.username == ADMIN_USERNAME and password_hash == ADMIN_PASSWORD:
        token = str(uuid.uuid4())
        active_sessions.add(token)
        return {"success": True, "token": token, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.post("/admin/logout")
async def admin_logout(token: str):
    if token in active_sessions:
        active_sessions.remove(token)
    return {"success": True, "message": "Logged out"}

@api_router.get("/flowers", response_model=List[Flower])
async def get_flowers(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(FlowerDB))
    flowers = result.scalars().all()
    return [Flower(id=f.id, name=f.name, price=f.price, image=f.image, category=f.category, created_at=f.created_at) for f in flowers]

@api_router.post("/admin/flowers", response_model=Flower)
async def create_flower(flower_data: FlowerCreate, token: str = Depends(verify_admin), session: AsyncSession = Depends(get_session)):
    flower_id = str(uuid.uuid4())
    db_flower = FlowerDB(id=flower_id, name=flower_data.name, price=flower_data.price, image=flower_data.image, category=flower_data.category, created_at=datetime.utcnow())
    session.add(db_flower)
    await session.commit()
    await session.refresh(db_flower)
    return Flower(id=db_flower.id, name=db_flower.name, price=db_flower.price, image=db_flower.image, category=db_flower.category, created_at=db_flower.created_at)

@api_router.put("/admin/flowers/{flower_id}", response_model=Flower)
async def update_flower(flower_id: str, flower_data: FlowerUpdate, token: str = Depends(verify_admin), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(FlowerDB).where(FlowerDB.id == flower_id))
    flower = result.scalar_one_or_none()
    if not flower:
        raise HTTPException(status_code=404, detail="Flower not found")
    if flower_data.name: flower.name = flower_data.name
    if flower_data.price: flower.price = flower_data.price
    if flower_data.image: flower.image = flower_data.image
    if flower_data.category: flower.category = flower_data.category
    await session.commit()
    await session.refresh(flower)
    return Flower(id=flower.id, name=flower.name, price=flower.price, image=flower.image, category=flower.category, created_at=flower.created_at)

@api_router.delete("/admin/flowers/{flower_id}")
async def delete_flower(flower_id: str, token: str = Depends(verify_admin), session: AsyncSession = Depends(get_session)):
    result = await session.execute(delete(FlowerDB).where(FlowerDB.id == flower_id))
    await session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Flower not found")
    return {"success": True, "message": "Flower deleted"}

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate, session: AsyncSession = Depends(get_session)):
    message_id = str(uuid.uuid4())
    db_message = ContactMessageDB(id=message_id, name=message_data.name, email=message_data.email, message=message_data.message, created_at=datetime.utcnow())
    session.add(db_message)
    await session.commit()
    await session.refresh(db_message)
    return ContactMessage(id=db_message.id, name=db_message.name, email=db_message.email, message=db_message.message, created_at=db_message.created_at)

@api_router.get("/admin/messages", response_model=List[ContactMessage])
async def get_contact_messages(token: str = Depends(verify_admin), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ContactMessageDB).order_by(ContactMessageDB.created_at.desc()))
    messages = result.scalars().all()
    return [ContactMessage(id=m.id, name=m.name, email=m.email, message=m.message, created_at=m.created_at) for m in messages]

app.include_router(api_router)

app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()
    logger.info("Database initialized")
