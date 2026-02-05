from app.services.signup_services import check_signup_alignment
from app.services.CRUD_services import get_db, create_resource, update_resource, get_multiple_criteria, special_flush_create_resource
from fastapi import APIRouter, Depends, HTTPException, Query
from app.classes.SignupClasses import SignupIn, SignupQuery,SignupOut, AvailabilityQuery
from app.routes.time_slot_routes import get_timeslot_availability
from collections import defaultdict
from sqlalchemy.orm import Session
from app.database_setup.models import Signup, Course, TimeSlot
from typing import Union, List, Optional
from datetime import datetime
router = APIRouter()

#Create Route(s)
@router.post("/signup/create", response_model=SignupIn)
async def create_signup(signup_in: SignupIn, db: Session = Depends(get_db)):
    #TODO: check if you can remove this
    try:
        signup_in.valid = await check_signup_alignment(signup_in,db)
    except Exception as e:
        print("some issue with validation")
        print(e)
    finally:
        return create_resource(pydantic_in=signup_in, db_model=Signup, db=db)




router = APIRouter()


# Assuming your existing Pydantic models are imported:
# SignupIn, SignupOut, AvailabilityQuery, etc.

@router.post("/signups/batch_create", response_model=List[SignupOut])
async def create_batch_signups(
        signups: List[SignupIn],
        db: Session = Depends(get_db)
):
    """
    Create a batch of signups after verifying availability.
    For each signup that is not for a flexible timeslot, group by (time_slot_id, startTime, endTime)
    and sum the total requested quantity. Also for each signup ensures we have enough seats.
    """
    group_quantities = defaultdict(int)
    # To avoid fetching the same timeslot record multiple times, store them by key.
    timeslot_cache = {}

    # Iterate over signups to group those requiring availability checks
    for signup in signups:
        # Retrieve the timeslot record using your helper function.
        timeslot = await get_multiple_criteria(TimeSlot, db, {"id": signup.time_slot_id}, multiple=False)
        if not timeslot:
            raise HTTPException(status_code=404, detail=f"TimeSlot {signup.time_slot_id} not found")

        # Cache the timeslot for later use.
        timeslot_cache[signup.time_slot_id] = timeslot

        # Only check availability if the timeslot is not flexible.
        #print('hi')
        if not getattr(timeslot, "flexible", False):
            key = (signup.time_slot_id, signup.startTime, signup.endTime)
            group_quantities[key] += signup.quantity or 0

    for (time_slot_id, start_time, end_time), total_quantity in group_quantities.items():
        # Build the availability query model.
        availability_query = AvailabilityQuery(
            startTime=start_time,
            endTime=end_time,
            time_slot_id=time_slot_id
        )
        # Call the availability endpoint to get the available seats.
        availability = await get_timeslot_availability(availability_query, db)
        available_seats = availability.get("available_seats", 0)
        if total_quantity > available_seats:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Not enough seats available for TimeSlot {time_slot_id} "
                    f"between {start_time} and {end_time}. Requested: {total_quantity}, "
                    f"available: {available_seats}"
                )
            )
    # All checks passed, so we're good to go!
    created_signups = []
    for signup in signups:
        new_signup = Signup(**signup.dict())
        db.add(new_signup)
        created_signups.append(new_signup)
    db.commit()
    return created_signups


@router.post("/signup/validate")
async def validate_signup(signup_in: SignupIn, db: Session = Depends(get_db)) -> bool:
    timeslot = db.query(TimeSlot).filter(TimeSlot.id == signup_in.time_slot_id).first()
    if timeslot and timeslot.rrule_string and signup_in.startTime and signup_in.endTime:
        return await check_signup_alignment(signup_in, db)
    return False
#Read Route(s)
@router.post("/signup/filter", response_model=List[SignupOut])
async def filter_signups(
    query: SignupQuery,
    db: Session = Depends(get_db),
):
    """
    Basically if you provide user id and course id it will give you all the signups for that user and that course

    If you just provide the course id it will give all the signups total for that course. Same for the time slot

    You can also filter by the start time/end time if you want to look at a specific day of that time slot. (For example february 3nd 5PM class or whatever)
    """
    # Convert to dict and remove None values
    criteria = {key: value for key, value in query.dict().items() if value is not None}

    # Pass the cleaned-up criteria to get_multiple_criteria
    records = await get_multiple_criteria(Signup, db, criteria, multiple=True)
    return records

#I need a couple sign up select routes.

#Update Route(s)
@router.post("/signup/update", response_model=SignupIn)
async def update_signup(signup_id : Union[int,str],signup_in: SignupIn,db: Session = Depends(get_db)):
    updated_signup = await update_resource(model=Signup, id=signup_id,pydantic_in=SignupIn,db=db,idName="id")
    return updated_signup

@router.get("/instructors/{instructor_id}/signups", response_model=List[SignupOut])
def get_instructor_signups(
        instructor_id: int,
        limit: int = Query(10, ge=1, description="Maximum number of signup records to return"),
        offest: int = Query(0, ge=0, description="Number of signup records to skip"),
        sort_by: str = Query("created_at", description="Signup attribute to sort by (any attribute of Signup)"),
        order: str = Query("desc", description="Sort order: 'asc' for ascending or 'desc' for descending"),
        from_date: Optional[datetime] = Query(
            None, description="Filter to include signups with a created_at timestamp on or after this date"
        ),
        to_date: Optional[datetime] = Query(
            None, description="Filter to include signups with a created_at timestamp on or before this date"
        ),
        db: Session = Depends(get_db)
):
    """
    Endpoint to retrieve a paginated list of signups for courses taught by a specific instructor.

    This endpoint returns signups for all courses taught by the instructor identified by `instructor_id`.
    It supports dynamic sorting based on any attribute of the Signup model and allows clients to define
    the sort order (ascending or descending), as well as pagination through the results.

    In addition to pagination and sorting, you can optionally filter signups by specifying a date range
    using `from_date` and `to_date`. These filters apply exclusively to the `created_at` timestamp of the signup records.

    Query Parameters:
        - limit (int): Maximum number of signup records to return. Controls the page size. (Default: 10)
        - offest (int): Number of signup records to skip from the beginning. Useful for pagination. (Default: 0)
        - sort_by (str): The attribute of the Signup model by which the records should be sorted.
          Can be any valid attribute such as 'created_at', 'user_id', etc. (Default: "created_at")
        - order (str): The order of sorting, either 'asc' for ascending or 'desc' for descending.
          (Default: "desc", so that the most recent signups are shown first)
        - from_date (datetime, optional): Filters the results to include only signups with a `created_at`
          timestamp on or after this date.
        - to_date (datetime, optional): Filters the results to include only signups with a `created_at`
          timestamp on or before this date.
    Returns:
        - A list of SignupOut objects representing the signup records for the instructor's courses,
          paginated, sorted, and optionally filtered by the created_at date range.
    """
    if order not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="Invalid order, must be 'asc' or 'desc'")

    #sorting
    sort_column = getattr(Signup, sort_by, None)
    if sort_column is None:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by field: {sort_by}")

    #the order clause
    order_clause = sort_column.asc() if order == "asc" else sort_column.desc()

    #TODO: double check this
    query = (
        db.query(Signup)
        .join(Course, Signup.course_id == Course.course_ID)
        .filter(Course.instructor_id == instructor_id)
    )

    #rish wants from date and to date stuff
    if from_date:
        query = query.filter(Signup.created_at >= from_date)
    if to_date:
        query = query.filter(Signup.created_at <= to_date)

    #good old pagination
    signups = (
        query.order_by(order_clause)
        .offset(offest)
        .limit(limit)
        .all()
    )
    return signups
