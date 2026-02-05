from typing import Optional
from pydantic import BaseModel
from app.classes.UserClasses import (UserIn,
                                     UserOut,
                                     UserBase,
                                     UserQuery,
                                     UserData,
                                     UserUpdate)
#TODO: make the user a field for some and not all
class InstructorBase(BaseModel):
    # Removed 'name' and 'image1_link' since they are not present in the new model
    # User ID is optional because
    user_id: Optional[str] = None
    rating: Optional[int] = None
    description: Optional[str] = None
    pfp_link: Optional[str] = None
    website_link: Optional[str] = None
    phone_number: Optional[str] = None
    street_address: Optional[str] = None
    stripeConnectedLinked: Optional[bool] = None
    stripeConnectedId: Optional[str] = None
    payment_method: Optional[str] = None
    profileCompleted: Optional[bool] = None
      # Nesting the related user data

    class Config:
        from_attributes = True  # Ensures we can construct from an ORM model

class InstructorIn(InstructorBase):
    pass

class InstructorOut(InstructorBase):
    # The new model includes 'id' as the primary key
    id: int
    user: Optional[UserOut] = None
class InstructorQuery(InstructorBase):
    user: Optional[UserOut] = None

class CombinedInstructorUserIn(BaseModel):
    instructor: InstructorIn
    user: UserUpdate

class CombinedInstructorUserOut(BaseModel):
    instructor: InstructorOut
    user: UserOut