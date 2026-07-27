from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DNSRecord, HostedZone, User
from ..schemas import DNSRecordCreate, DNSRecordOut, DNSRecordUpdate
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/dns-records", tags=["DNS records"])


def zone_for_user(zone_id: str, user: User, db: Session) -> HostedZone:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id, HostedZone.owner_id == user.id).first()
    if not zone: raise HTTPException(404, "Hosted zone not found")
    return zone


def record_for_user(record_id: str, user: User, db: Session) -> DNSRecord:
    record = db.query(DNSRecord).join(HostedZone).filter(DNSRecord.id == record_id, HostedZone.owner_id == user.id).first()
    if not record: raise HTTPException(404, "DNS record not found")
    return record


@router.get("/zone/{zone_id}", response_model=list[DNSRecordOut])
def list_records(zone_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zone_for_user(zone_id, user, db)
    return db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).order_by(DNSRecord.name, DNSRecord.type).all()


from pydantic import BaseModel

class BINDImportRequest(BaseModel):
    bind_text: str


@router.post("/zone/{zone_id}/import-bind")
def import_bind_records(zone_id: str, payload: BINDImportRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zone = zone_for_user(zone_id, user, db)
    from ..utils.bind import parse_bind_zone
    parsed = parse_bind_zone(payload.bind_text, zone.domain_name)

    created = []
    for item in parsed:
        record = DNSRecord(
            name=item["name"],
            type=item["type"],
            value=item["value"],
            ttl=item["ttl"],
            description=item["description"],
            hosted_zone_id=zone_id
        )
        db.add(record)
        created.append(record)

    db.commit()
    return {"message": f"Successfully imported {len(created)} records", "count": len(created)}


@router.post("/zone/{zone_id}", response_model=DNSRecordOut, status_code=status.HTTP_201_CREATED)
def create_record(zone_id: str, payload: DNSRecordCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zone_for_user(zone_id, user, db)
    record = DNSRecord(**payload.model_dump(), hosted_zone_id=zone_id)
    db.add(record); db.commit(); db.refresh(record)
    return record



@router.put("/record/{record_id}", response_model=DNSRecordOut)
def update_record(record_id: str, payload: DNSRecordUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    record = record_for_user(record_id, user, db)
    for key, value in payload.model_dump().items(): setattr(record, key, value)
    db.commit(); db.refresh(record)
    return record


@router.delete("/record/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.delete(record_for_user(record_id, user, db)); db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
