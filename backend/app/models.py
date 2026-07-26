from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def id_value() -> str:
    return str(uuid4())


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=id_value)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    hosted_zones: Mapped[list["HostedZone"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class HostedZone(Base):
    __tablename__ = "hosted_zones"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=id_value)
    domain_name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    owner: Mapped[User] = relationship(back_populates="hosted_zones")
    records: Mapped[list["DNSRecord"]] = relationship(back_populates="hosted_zone", cascade="all, delete-orphan")


class DNSRecord(Base):
    __tablename__ = "dns_records"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=id_value)
    name: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str] = mapped_column(String(10))
    value: Mapped[str] = mapped_column(Text)
    ttl: Mapped[int] = mapped_column(Integer, default=300)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hosted_zone_id: Mapped[str] = mapped_column(ForeignKey("hosted_zones.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    hosted_zone: Mapped[HostedZone] = relationship(back_populates="records")
