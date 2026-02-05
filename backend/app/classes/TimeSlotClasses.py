from pydantic import BaseModel, field_validator, model_validator, Field
from typing import Optional, List
from datetime import datetime
from dateutil.rrule import rrulestr


class TimeSlotBase(BaseModel):
    description: Optional[str] = None
    spots: Optional[int] = None
    dtstart: Optional[datetime] = None
    dtend: Optional[datetime] = None
    rrule_string: Optional[str] = None
    duration: Optional[int] = None
    rdates: Optional[List[str]] = None
    exdates: Optional[List[str]] = None
    flexible: Optional[bool] = None
    visible: Optional[bool] = True
    course_id: Optional[int] = None


class TimeSlotIn(TimeSlotBase):
    """
    Use this for creating new TimeSlots.
    """
    description: str
    spots: Optional[int] = Field(None, ge=1)
    @field_validator("rrule_string")
    @classmethod
    def check_rrule_string(cls, value):
        if value is not None:
            try:
                rrulestr(value)
            except Exception:
                raise ValueError("Invalid RRULE string")
        return value
    @model_validator(mode="after")
    def check_dates_consistency(self):

        if self.dtstart and self.dtend and self.dtstart > self.dtend:
            raise ValueError("The start date (dtstart) must be before the end date (dtend).")
        if self.rrule_string and self.dtstart:
            try:
                rule = rrulestr(self.rrule_string, dtstart=self.dtstart)
            except Exception:
                raise ValueError("Invalid RRULE string")

            until = getattr(rule, '_until', None)
            if until and self.dtstart > until:
                raise ValueError(
                    "The start date (dtstart) is after the UNTIL date specified in the RRULE string."
                )

        return self

class TimeSlotUpdate(TimeSlotIn):
    description: Optional[str] = None
class TimeSlotOut(TimeSlotBase):
    """
    Use this for reading TimeSlots (includes the 'id').
    """
    id: int

    class Config:
        # Allow Pydantic to read data from an ORM model
        from_attributes = True


class TimeSlotQuery(TimeSlotBase):
    """
    Use this model when you want to filter
    TimeSlot objects by any combination of fields.
    All fields are optional.
    """
    id: Optional[int] = None
    course_id: Optional[int] = None
