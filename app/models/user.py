from sqlalchemy import Column, Integer, String
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    api_key = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    monthly_limit = Column(Integer, default=500000)
    used_characters = Column(Integer, default=0)