from pydantic import BaseModel, field_validator, model_validator
from typing import Optional, List
from datetime import date, datetime


class EmailAddress(BaseModel):
    email_address: str


class UserBase(BaseModel):
    id: str
    external_id: Optional[str] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    birthday: Optional[date] = None
    email: Optional[str] = None
    name: Optional[str] = None
    guardian_id: Optional[str] = None
    guardian_email: Optional[str] = None
    address: Optional[str] = None
    default_longitude: Optional[float] = None
    default_latitude: Optional[float] = None
    phone_number: Optional[str] = None
    password_enabled: Optional[bool] = False
    image_url: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_sign_in_at: Optional[datetime] = None
    primary_phone_number_id: Optional[str] = None

    class Config:
        from_attributes = True  # Ensures we can construct from an ORM model

class UserData(UserBase):
    # This field is present in the incoming payload but not stored directly in the DB.
    email_addresses: Optional[List[EmailAddress]] = None

    @model_validator(mode="after")
    def set_email_from_email_addresses(cls, model: "UserData") -> "UserData":
        """
        Model-level validator that runs after model instantiation.

        If 'email' is missing and 'email_addresses' is provided,
        set 'email' to the first email address in the list.
        """
        if not model.email and model.email_addresses:
            model.email = model.email_addresses[0].email_address
        return model

    @field_validator("created_at", "updated_at", "last_sign_in_at", mode="before")
    def convert_timestamp(cls, value):
        """
        Field validator for timestamp fields.

        Converts an integer timestamp (milliseconds) to a Python datetime object.
        """
        if isinstance(value, int):
            return datetime.fromtimestamp(value / 1000.0)
        return value

    @field_validator("birthday", mode="before")
    def empty_birthday_to_none(cls, value):
        """
        Field validator for the 'birthday' field.

        Converts an empty string to None.
        """
        if isinstance(value, str) and value.strip() == "":
            return None
        return value


class UserIn(BaseModel):
    data: UserData
    object: Optional[str]
    type: Optional[str]


class UserOut(UserBase):
    pass


class UserQuery(UserBase):
    pass
#TODO: Make sure any invalid columns don't just get ignored but rather they should throw an error!
class UserUpdate(UserBase):
    id: Optional[str] = None