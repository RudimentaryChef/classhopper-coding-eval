from app.services.CRUD_services import get_by_id,get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import DeclarativeMeta
from typing import TypeVar
import app.database_setup.models as models
from app.classes.InstructorClasses import InstructorOut
from app.database_setup.db import Base
from sqlalchemy.exc import SQLAlchemyError
import pymysql

T = TypeVar("T", bound=DeclarativeMeta)
router = APIRouter()
#Generic GET method to retrieve any table entity by ID dynamically
@router.get("/{model_name}/byID/{id}")
async def get_entity_by_id(model_name: str, id: int, idName = "id", db: Session = Depends(get_db)):


    # Convert model_name to PascalCase (first letter capitalized)
    model_class_name = model_name.capitalize()

    # Dynamically get the model from app.models
    model = getattr(models, model_class_name, None)

    if model is None:
        raise HTTPException(status_code=400, detail="Invalid model name")

    return await get_by_id(model,id, db,idName=idName)

@router.get("/utility/all/{table_name}")
async def get_all_records(
    table_name: str,
    db: Session = Depends(get_db)
):
    try:
        # Dynamically retrieve all mapped SQLAlchemy models
        model_mapping = {model.__tablename__: model for model in Base.registry._class_registry.values()
                         if isinstance(model, DeclarativeMeta)}

        # Get the model class from the provided table name
        model = model_mapping.get(table_name.lower())
        if not model:
            raise HTTPException(status_code=400, detail=f"Table '{table_name}' not found.")
        #select all from the table
        records = db.query(model).all()
        # Convert records to a list of dictionaries (avoiding serialization issues)
        return [record.__dict__ for record in records]
    except (pymysql.MySQLError, SQLAlchemyError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        ) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e