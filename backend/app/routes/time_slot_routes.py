from fastapi import APIRouter, Depends
from typing import List, Union
from sqlalchemy.orm import Session

from app.services.CRUD_services import get_db, create_resource, update_resource, get_multiple_criteria, delete_resource
from app.database_setup.models import TimeSlot, Signup
# Assuming you have these classes in app.classes.TimeSlotClasses
from app.classes.TimeSlotClasses import TimeSlotIn, TimeSlotOut, TimeSlotQuery, TimeSlotUpdate
from app.classes.SignupClasses import SignupOut, AvailabilityQuery

router = APIRouter()

# ---------------------------------------------
# CREATE
# ---------------------------------------------
@router.post("/timeslot/create", response_model=TimeSlotOut)
async def create_timeslot(timeslot_in: TimeSlotIn, db: Session = Depends(get_db)):
    """
    Create a new TimeSlot resource using TimeSlotIn data.
    Returns the newly created TimeSlotOut (including its ID).
    """
    # Ensure the course exists and enforce a maximum of 10 time slots per course.
    course_id = timeslot_in.course_id
    # Query the count of existing time slots for this course.
    timeslot_count = db.query(TimeSlot).filter(
        TimeSlot.course_id == course_id,
        TimeSlot.visible == True
    ).count()
    if timeslot_count >= 10:
        raise HTTPException(
            status_code=400,
            detail="A course cannot have more than 10 visible time slots."
        )

    return create_resource(pydantic_in=timeslot_in, db_model=TimeSlot, db=db)


# ---------------------------------------------
# READ (Filter)
# ---------------------------------------------
@router.post("/timeslot/filter", response_model=List[TimeSlotOut])
async def filter_timeslots(
    query: TimeSlotQuery,
    db: Session = Depends(get_db),
):
    """
    Provide any optional fields (e.g. description, spots, course_id, etc.)
    to filter TimeSlots. Only non-None fields are used as filter criteria.
    """
    # Convert to dict and remove None values
    criteria = {key: value for key, value in query.dict().items() if value is not None}
    # Pass the cleaned-up criteria to get_multiple_criteria
    records = await get_multiple_criteria(TimeSlot, db, criteria, multiple=True)
    return records


# ---------------------------------------------
# READ (Single by ID)
# ---------------------------------------------
@router.get("/timeslot/{timeslot_id}", response_model=TimeSlotOut)
async def get_timeslot_by_id(timeslot_id: int, db: Session = Depends(get_db)):
    """
    Fetch a single TimeSlot by its primary key ID.
    """
    criteria = {"id": timeslot_id}
    record = await get_multiple_criteria(TimeSlot, db, criteria, multiple=False)
    return record


#just get every time slot ever. Not sure why I'd need this but why not!
@router.get("/timeslot/getAll/things", response_model=List[TimeSlotOut])
async def get_all_timeslots(db: Session = Depends(get_db)):
    """
    Get all TimeSlots in the database.
    """
    records = await get_multiple_criteria(TimeSlot, db, criteria={}, multiple=True)
    return records



# ---------------------------------------------
# UPDATE
# ---------------------------------------------
@router.post("/timeslot/update", response_model=TimeSlotOut)
async def update_timeslot(
    timeslot_id: Union[int, str],
    timeslot_in: TimeSlotUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing TimeSlot.
    """
    updated_timeslot = await update_resource(
        model=TimeSlot,
        id=timeslot_id,
        pydantic_in=timeslot_in,
        db=db,
        idName="id"
    )
    return updated_timeslot


from fastapi import HTTPException
from typing import Dict, Any

from fastapi import HTTPException
from typing import Dict, Any


@router.delete("/timeslot/HARDdelete/{timeslot_id}", response_model=Dict[str, Any])
async def delete_timeslot(timeslot_id: Union[int, str], db: Session = Depends(get_db)):
    """
    Delete a TimeSlot by its ID.
    Returns a dictionary containing:
      - "deleted_timeslot": the deleted TimeSlot as a Pydantic model
      - "deleted_signups": a list of associated Signup objects (converted to Pydantic models)
    """
    # Retrieve the TimeSlot and its associated signups from the database
    timeslot = db.query(TimeSlot).filter(TimeSlot.id == timeslot_id).first()
    if not timeslot:
        raise HTTPException(status_code=404, detail="TimeSlot not found")

    # Capture the list of signup objects before deletion
    deleted_signups = list(timeslot.signups)

    # Convert the SQLAlchemy TimeSlot object into a Pydantic model
    deleted_timeslot_data = TimeSlotOut.from_orm(timeslot)

    # Convert each Signup object into a Pydantic model
    deleted_signups_data = [SignupOut.from_orm(signup) for signup in deleted_signups]

    # Delete the time slot (cascade deletion should handle the signups if configured)
    db.delete(timeslot)
    db.commit()

    return {"deleted_timeslot": deleted_timeslot_data, "deleted_signups": deleted_signups_data}


@router.post("/timeslot/availability", response_model=Dict[str, int])
async def get_timeslot_availability(
        query: AvailabilityQuery,
        db: Session = Depends(get_db)
) -> Dict[str, int]:
    """
    Calculate available seats for a given TimeSlot.

    The route uses the AvailabilityQuery model to allow filtering the signups.
    The `time_slot_id` is enforced from the URL path to ensure consistency.

    It first retrieves the TimeSlot, then gets all Signup records that match the filter criteria,
    sums their quantities, and subtracts that from the TimeSlot's spots.
    """
    # Build filter criteria from the query model and enforce the route's timeslot_id.

    criteria = query.dict(exclude_unset=True)
    timeslot_id = criteria["time_slot_id"]
    # Retrieve the TimeSlot record.
    #TODO: figure out how to do this when we have the time slots being represented differently
    timeslot = await get_multiple_criteria(TimeSlot, db, {"id": timeslot_id}, multiple=False)
    if not timeslot:
        raise HTTPException(status_code=404, detail="TimeSlot not found")

    # Retrieve Signup records matching the criteria.
    signups = await get_multiple_criteria(Signup, db, criteria, multiple=True)
    #print(signups)
    # Sum the quantity from signups; if quantity is None, assume 0.
    taken_seats = sum(s.quantity or 0 for s in signups)
    #print(taken_seats)
    # Calculate available seats.
    available_seats = timeslot.spots - taken_seats

    return {"available_seats": available_seats}


@router.delete("/timeslot/SOFTdelete/{timeslot_id}", response_model=Dict[str, Any])
async def delete_or_hide_timeslot(timeslot_id: int, db: Session = Depends(get_db)):
    """
    Delete a TimeSlot by its ID. If there are any signups associated with the time slot,
    the route sets the time slot's visibility to False instead of deleting it.
    Otherwise, it deletes the time slot.
    Possible Responses
    {"message": "TimeSlot has associated signups. Visibility set to False."}
    {"message": "TimeSlot deleted successfully."}
    HTTPException(status_code=404, detail="TimeSlot not found")
    HTTPException(status_code=500, detail=f"An error occurred while processing the request: {str(e)}")
    """
    try:
        timeslot = db.query(TimeSlot).filter(TimeSlot.id == timeslot_id).first()
        if not timeslot:
            raise HTTPException(status_code=404, detail="TimeSlot not found")
        signup_exists = db.query(Signup).filter(Signup.time_slot_id == timeslot_id).first()
        if signup_exists:
            timeslot.visible = False
            db.commit()
            return {"message": "TimeSlot has associated signups. Visibility set to False."}
        else:
            db.delete(timeslot)
            db.commit()
            return {"message": "TimeSlot deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the request: {str(e)}")