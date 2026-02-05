#Create user

from app.classes.UserClasses import UserIn,UserOut,UserBase,UserQuery, UserUpdate

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from typing import List, Union
from app.database_setup.models import User
router = APIRouter()
from app.services.CRUD_services import get_db, create_resource, update_resource, get_multiple_criteria, get_by_id
@router.post("/users/filter", response_model=List[UserOut])
async def filter_users(
    query: UserQuery,
    db: Session = Depends(get_db),
):
    """
    Provide any optional fields to filter the users
    """
    # Convert to dict and remove None values
    criteria = {key: value for key, value in query.dict().items() if value is not None}

    # Pass the cleaned-up criteria to get_multiple_criteria
    records = await get_multiple_criteria(User, db, criteria, multiple=True)
    return records


# user_routes.py

@router.get("/users/userByID/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    """
    Fetch a user by their ID using the generic get_by_id function.

    :param user_id: The unique identifier of the user.
    :param db: The database session provided by the get_db dependency.
    :return: The user instance matching the provided ID.
    """
    return await get_by_id(model=User, id=user_id, db=db)


@router.post("/users/create", response_model=UserOut)
async def create_user(user_in: UserIn, db: Session = Depends(get_db)):
    """
    Create a new user using the generic create_resource function.

    Input data is like the thing you give me from the Clerk API and I parse it

    :param user_in: The Pydantic model instance containing the new user data.
    :param db: The database session.
    :return: The created user instance.
    """
    user = create_resource(
        pydantic_in=user_in.data,  # Extract the nested UserData
        db_model=User,
        db=db,
        exclude={"email_addresses"}  # Exclude the extra field that does not exist on the DB model.
    )
    return user


@router.put("/users/update", response_model=UserOut)
async def update_user(
        user_id: Union[int, str],
        user_update: UserUpdate,
        db: Session = Depends(get_db)
):
    """
    Update an existing user using the generic update_resource function.

    This endpoint updates the user identified by `user_id` with the provided data.

    :param user_id: The identifier of the user to update.
    :param user_in: The Pydantic model instance containing the updated user data.
    :param db: The database session.
    :return: The updated user instance.
    """
    updated_user = await update_resource(
        model=User,
        id=user_id,
        pydantic_in=user_update,
        db=db,
        idName="id"
    )
    return updated_user
