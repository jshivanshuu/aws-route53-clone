import hashlib

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import HostedZone, User
from ..schemas import HostedZoneCreate, HostedZoneOut, HostedZoneUpdate
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/hosted-zones", tags=["Hosted zones"])


def serialize(zone: HostedZone) -> dict:
    digest = hashlib.sha256(zone.id.encode()).hexdigest()
    nameservers = [f"ns-{int(digest[i:i+4], 16) % 2048 + 1}.awsdns-{['com','net','org','co.uk'][n]}." for n, i in enumerate(range(0, 16, 4))]
    return {"id": zone.id, "domain_name": zone.domain_name, "description": zone.description, "is_private": zone.is_private, "owner_id": zone.owner_id, "created_at": zone.created_at, "record_count": len(zone.records), "nameservers": nameservers}


def find_zone(zone_id: str, user: User, db: Session) -> HostedZone:
    zone = db.query(HostedZone).options(selectinload(HostedZone.records)).filter(HostedZone.id == zone_id, HostedZone.owner_id == user.id).first()
    if not zone:
        raise HTTPException(404, "Hosted zone not found")
    return zone


@router.get("", response_model=list[HostedZoneOut])
def list_zones(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zones = db.query(HostedZone).options(selectinload(HostedZone.records)).filter(HostedZone.owner_id == user.id).order_by(HostedZone.created_at.desc()).all()
    return [serialize(zone) for zone in zones]


@router.post("", response_model=HostedZoneOut, status_code=status.HTTP_201_CREATED)
def create_zone(payload: HostedZoneCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zone = HostedZone(**payload.model_dump(), owner_id=user.id)
    db.add(zone); db.commit(); db.refresh(zone)
    return serialize(zone)


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_zone(zone_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return serialize(find_zone(zone_id, user, db))


@router.put("/{zone_id}", response_model=HostedZoneOut)
def update_zone(zone_id: str, payload: HostedZoneUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    zone = find_zone(zone_id, user, db)
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(zone, key, value)
    db.commit(); db.refresh(zone)
    return serialize(zone)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.delete(find_zone(zone_id, user, db)); db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
