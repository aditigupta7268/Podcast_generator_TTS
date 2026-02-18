from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    text_length = Column(Integer)
    file_size = Column(Float)
    duration = Column(Float)
    response_time = Column(Float)