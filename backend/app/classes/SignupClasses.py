from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime

class SignupBase(BaseModel):
    user_id: str
    course_id : int
    time_slot_id: int
    #submission_id: Optional[str] = None
    #respondent_id: Optional[str] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    valid: Optional[bool] = None
    transaction_id: Optional[str] = None
    quantity: Optional[int] = None
    price_paid: Optional[float] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
class SignupIn(SignupBase):
    time_slot_id: Optional[int] = None
    user_id: Optional[str] = None
    course_id : Optional[int] = None
    pass
class SignupOut(SignupBase):
    id: int
    created_at: Optional[datetime] = None

class SignupQuery(BaseModel):
    # All fields are optional so you can provide any subset
    user_id: Optional[str] = None
    course_id: Optional[int] = None
    time_slot_id: Optional[int] = None
    student_name: Optional[str] = None
    #submission_id: Optional[str] = None
    #respondent_id: Optional[str] = None
    startTime: Optional[datetime] = None
    endTime: Optional[datetime] = None
    valid: Optional[bool] = None
    created_at: Optional[datetime] = None
    transaction_id: Optional[str] = None
    quantity: Optional[int] = None
    price_paid: Optional[float] = None
    created_at: Optional[datetime] = None
class AvailabilityQuery(BaseModel):
    startTime: datetime
    endTime: datetime
    time_slot_id: int