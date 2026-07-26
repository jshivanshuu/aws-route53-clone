from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(UserCreate):
    pass


class UserOut(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class HostedZoneCreate(BaseModel):
    domain_name: str = Field(min_length=1, max_length=253)
    description: str | None = Field(default=None, max_length=1000)
    is_private: bool = False

    @field_validator("domain_name")
    @classmethod
    def normalise_domain(cls, value: str) -> str:
        return value.strip().lower().rstrip(".")


class HostedZoneUpdate(BaseModel):
    description: str | None = Field(default=None, max_length=1000)
    is_private: bool | None = None


class HostedZoneOut(HostedZoneCreate):
    id: str
    owner_id: str
    created_at: datetime
    record_count: int = 0
    nameservers: list[str] = []
    model_config = {"from_attributes": True}


class DNSRecordCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: RecordType
    value: str = Field(min_length=1, max_length=4000)
    ttl: int = Field(default=300, ge=0, le=2147483647)
    description: str | None = Field(default=None, max_length=1000)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return value.strip().rstrip(".")


class DNSRecordUpdate(DNSRecordCreate):
    pass


class DNSRecordOut(DNSRecordCreate):
    id: str
    hosted_zone_id: str
    created_at: datetime
    model_config = {"from_attributes": True}
