from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityOut
from app.auth.jwt import get_current_active_user

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.get("/", response_model=List[ActivityOut])
def get_activities(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)) -> Any:
    activities = db.query(Activity).filter(Activity.user_id == current_user.id).order_by(Activity.created_at.desc()).all()
    return activities

@router.post("/", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(activity_in: ActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)) -> Any:
    activity = Activity(
        **activity_in.model_dump(),
        user_id=current_user.id
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)) -> None:
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == current_user.id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return None

@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(activity_id: int, activity_in: ActivityUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)) -> Any:
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.user_id == current_user.id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    update_data = activity_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity
