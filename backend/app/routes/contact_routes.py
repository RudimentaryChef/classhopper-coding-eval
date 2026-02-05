from app.classes.Contact import ContactIn, ContactOut, ContactQuery
from app.services.CRUD_services import update_resource, create_resource,get_db,get_by_id, get_multiple_criteria

from typing import List, Union
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database_setup.models import Contact
router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.get("/contactByID/{contact_id}", response_model=ContactOut)
async def get_contact_by_id(contact_id: int, db: Session = Depends(get_db)):
    """Fetch a contact by their ID using the generic get_by_id function"""
    return await get_by_id(model=Contact, id=contact_id, db=db)

@router.post("/create", response_model=ContactOut)
async def create_contact(contact_in: ContactIn, db: Session = Depends(get_db)):
    """Creates a contact and returns the created instance"""
    contact = create_resource(pydantic_in=contact_in, db_model=Contact, db=db)
    return contact

@router.put("/update", response_model=ContactOut)
async def update_contact(
    contact_id: Union[int, str],
    contact_in: ContactIn,
    db: Session = Depends(get_db),
):
    """Updates a contact by ID and returns the updated instance"""
    updated = await update_resource(
        model=Contact,
        id=contact_id,
        pydantic_in=contact_in,
        db=db,
        idName="id"
    )
    return updated

@router.post("/filter", response_model=List[ContactOut])
async def filter_contacts(
    query: ContactQuery,
    db: Session = Depends(get_db),
):
    """
    Provide any optional fields (email, phone) to filter Contacts.
    Only non-None fields are used as filter criteria.
    """
    criteria = {k: v for k, v in query.dict().items() if v is not None}
    records = await get_multiple_criteria(Contact, db, criteria, multiple=True)
    return records
