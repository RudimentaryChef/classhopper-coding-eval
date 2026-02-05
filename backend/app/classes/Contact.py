from typing import Optional
from pydantic import BaseModel, EmailStr
class ContactBase(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
class ContactIn(ContactBase):
    pass
class ContactOut(ContactBase):
    id: Optional[int] = None
    pass
class ContactQuery(ContactBase):
    id: Optional[int] = None
    pass