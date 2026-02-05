from app.database_setup.db import SessionLocal
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy import and_
from typing import Type, TypeVar, Union, Any, Dict
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
import pymysql
from app.classes.InstructorClasses import InstructorOut
T = TypeVar("T", bound=DeclarativeMeta)
ModelType = TypeVar("ModelType", bound=DeclarativeMeta)
router = APIRouter()

"""CREATE"""
# A generic creator
def create_resource(
        pydantic_in: BaseModel,
        db_model: Type[ModelType],
        db: Session,
        exclude: set = None
) -> ModelType:
    try:
        data_dict = pydantic_in.dict(exclude=exclude)
        db_obj = db_model(**data_dict)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    except (pymysql.MySQLError, SQLAlchemyError) as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        ) from e

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e
def special_flush_create_resource(
        pydantic_in: BaseModel,
        db_model: Type[ModelType],
        db: Session,
        exclude: set = None
) -> ModelType:
    try:
        data_dict = pydantic_in.dict(exclude=exclude)
        db_obj = db_model(**data_dict)
        db.add(db_obj)
        # Use flush() to send changes to the database without committing them
        db.flush()
        db.refresh(db_obj)
        return db_obj

    except (pymysql.MySQLError, SQLAlchemyError) as e:
        # No explicit rollback is necessary here—the outer transaction will roll back on exception.
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e

#This is a helpful tool to return a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#Generic function to fetch a record by ID.
"""READ"""
#TODO: id should be generic
async def get_by_id(model: Type[T], id: Any, db: Session, idName = "id"):
    try:

        if not hasattr(model, str(idName)):
            raise HTTPException(status_code=400, detail=f"Model {model.__name__} has no attribute '{idName}'")
        record = db.query(model).filter(getattr(model,idName) == id).first()
        if record is None:
            raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
        return record
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_multiple_criteria(
        model: Type[T],
        db: Session,
        criteria: Dict[str, Any],
        multiple: bool = True
) -> Any:
    for field in criteria:
        if not hasattr(model,field):
            raise HTTPException(
                status_code=400,
                detail=f"Model '{model.__name__}' has no attribute '{field}'"
            )
    filter_conditions = []
    for field,value in criteria.items():
        filter_conditions.append(getattr(model,field) == value)
    query = db.query(model).filter(and_(*filter_conditions))
    if multiple:
        records = query.all()
        return records
    else:
        record = query.first()
        if not record:
            raise HTTPException(status_code=404, detail=f"{model.__name__} not found.")
        return record
"""UPDATE"""
async def update_resource(
    model: Type[T],
    id: Union[int, str],
    pydantic_in: BaseModel,
    db: Session,
    idName: str = "id"
) -> T:
    """
    Generic function to update a record in the DB using an existing get_by_id function.
    """
    try:
        #Retrieve the existing record using get_by_id
        record = await get_by_id(model, id, db, idName)

        #Update columns from the Pydantic model
        updated_data = pydantic_in.dict(exclude_unset=True)
        #Validate columns
        for field_name, field_value in updated_data.items():
            setattr(record, field_name, field_value)

        db.commit()
        db.refresh(record)
        return record
    #error handling
    except (pymysql.MySQLError, SQLAlchemyError) as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        ) from e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e

"""DELETE"""

async def delete_resource(model: Type[T], id: Union[int, str], db: Session, idName: str = "id") -> T:
    """
    Generic function to delete a record in the DB using an existing get_by_id function.
    """
    try:
        # Retrieve the existing record using get_by_id
        record = await get_by_id(model, id, db, idName)
        # Delete the record and commit the changes
        db.delete(record)
        db.commit()
        return record
    except (pymysql.MySQLError, SQLAlchemyError) as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        ) from e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) from e
