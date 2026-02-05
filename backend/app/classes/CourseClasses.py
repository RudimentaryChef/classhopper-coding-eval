from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from typing import Optional, List, Literal
from app.classes.InstructorClasses import InstructorOut
from app.classes.TimeSlotClasses import TimeSlotOut, TimeSlotIn
from datetime import datetime, date
import sys
class CourseBase(BaseModel):
    course_Name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    form_Link: Optional[str] = None
    image_1_Link: Optional[str] = None
    image_2_Link: Optional[str] = None
    image_3_Link: Optional[str] = None
    online: Optional[bool] = False
    course_Price: Optional[Decimal] = None
    signup_Form_Link: Optional[str] = None
    course_Rating: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    instructor_id: Optional[int] = None
    organization_ID: Optional[int] = None
    minimum_age: Optional[int] = None
    tag_1: Optional[str] = None
    tag_2: Optional[str] = None
    tag_3: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    visibility: Optional[bool] = None
    flexible: Optional[bool] = False
    trialClass: Optional[bool] = False

    class Config:
        from_attributes = True

class CourseIn(CourseBase):
    visibility: Optional[bool] = False
class CourseQuery(CourseBase):
    course_ID: Optional[int] = None

class CourseOut(CourseBase):
    course_ID: Optional[int] = None
    distance: Optional[float] = None
    instructor: Optional[InstructorOut] = None
    time_slots: List[TimeSlotOut] = Field(default_factory=[], alias="section")

    @field_validator("time_slots", mode="before")
    def filter_visible_slots(cls, value):
        if isinstance(value, list):
            filtered = []
            for item in value:
                # When input is a dict (pre-parsing) or an object (post-parsing)
                if isinstance(item, dict):
                    if item.get("visible") is True:
                        filtered.append(item)
                else:
                    if getattr(item, "visible", False) is True:
                        filtered.append(item)
            return filtered
        return value

    class Config:
        populate_by_name = True
        from_attributes = True
class CourseOutInvisibleTimeslots(CourseBase):
    course_ID: Optional[int] = None
    distance: Optional[float] = None
    instructor: Optional[InstructorOut] = None
    time_slots: List[TimeSlotOut] = Field(default_factory=[], alias="section")
    class Config:
        populate_by_name = True
        from_attributes = True

class CourseSorter(BaseModel):
    sorted: Literal["asc", "desc"] = "asc"
    lessThan: int = Field(default=sys.maxsize - 1)
    greaterThan: int = Field(default=float(0))
    by: Literal["location", "rating", "price", "None"] = "None"
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    class_type: Literal["online", "in_person", "both"] = "both"
class CourseCombinedIn(CourseIn):
    #instructor: Optional[InstructorIn] = None
    # The alias "section" ensures that incoming JSON with key "section" is mapped to this field.
    time_slots: List[TimeSlotIn] = Field(default_factory=list, alias="section")