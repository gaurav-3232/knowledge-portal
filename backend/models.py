import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # 'user' | 'admin'
    created_at = Column(DateTime, server_default=func.now())


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    role = Column(String(50), default="user")
    created_at = Column(DateTime, server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", foreign_keys=[user_id])


class Attachment(Base):
    __tablename__ = "attachments"
    id = Column(Integer, primary_key=True)
    doc_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    mime = Column(String(128), nullable=True)
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", backref="attachments")
