from app.services.CRUD_services import get_db, create_resource
from app.classes.InstructorClasses import InstructorIn, InstructorOut, InstructorQuery, CombinedInstructorUserOut, CombinedInstructorUserIn
from app.database_setup.models import Instructor, User, Course
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.CRUD_services import get_by_id, get_multiple_criteria
from app.services.CRUD_services import update_resource
from typing import Union, List
router = APIRouter()

@router.get("/instructors/instructorByID/{instructor_id}", response_model=InstructorOut)
async def get_instructor_by_id(instructor_id: int, db: Session = Depends(get_db)):
    """Fetch an instructor by their ID using the generic get_by_id function"""
    return await get_by_id(model=Instructor,  id=instructor_id, db=db)
@router.post("/instructors/create", response_model=InstructorOut)
async def create_instructor(instructor_in: InstructorIn, db: Session = Depends(get_db)):
    """Creates an instructor and returns the created instance"""
    instructor = create_resource(pydantic_in=instructor_in, db_model=Instructor,db=db)
    return instructor

@router.put("/instructors/update", response_model=InstructorOut)
async def update_instructor(
        instructor_id: Union[int, str],
        instructor_in: InstructorIn,
        db: Session = Depends(get_db)
):
    updated_instructor = await update_resource(
        model=Instructor,
        id=instructor_id,
        pydantic_in=instructor_in,
        db=db,
        idName="id"
    )
    return updated_instructor


@router.post("/instructors/filter", response_model=List[InstructorOut])
async def filter_instructors(
    query: InstructorQuery,
    db: Session = Depends(get_db),
):
    """
    Provide any optional fields (e.g. description, spots, course_id, etc.)
    to filter Instructors. Only non-None fields are used as filter criteria.
    """
    # Convert to dict and remove None values
    criteria = {key: value for key, value in query.dict().items() if value is not None}
    # Pass the cleaned-up criteria to get_multiple_criteria
    records = await get_multiple_criteria(Instructor, db, criteria, multiple=True)
    return records
@router.get("/instructors/is_instructor/{user_id}", response_model=bool)
async def is_instructor(user_id: Union[int, str], db: Session = Depends(get_db)):
    """Checks if a user is an instructor by searching for their user_id in the Instructor table."""
    criteria = {"user_id": user_id}
    instructors = await get_multiple_criteria(model=Instructor, db=db, criteria=criteria, multiple=True)
    return len(instructors) > 0
#TODO: Combine these two routes
@router.get("/instructors/instructor_and_user/{instructor_id}", response_model=CombinedInstructorUserOut)
async def get_instructor_and_user(
    instructor_id: Union[int, str],
    db: Session = Depends(get_db)
):
    #returns a combined version of instructor and user
    result = db.query(Instructor, User) \
               .join(User, Instructor.user_id == User.id) \
               .filter(Instructor.id == instructor_id) \
               .first()
    if not result:
        raise HTTPException(status_code=404, detail="Instructor or associated user not found")
    instructor, user = result
    return {"instructor": instructor, "user": user}
@router.get("/instructors/instructor_and_user_user_id_version/{user_id}", response_model=CombinedInstructorUserOut)
async def get_instructor_by_user_id(
    user_id: str,
    db: Session = Depends(get_db)
):
    # Query joining Instructor and User filtered by user_id
    result = db.query(Instructor, User) \
               .join(User, Instructor.user_id == User.id) \
               .filter(User.id == user_id) \
               .first()
    if not result:
        raise HTTPException(status_code=404, detail="Instructor or associated user not found")
    instructor, user = result

    return {"instructor":instructor, "user":user}


# Route to update both Instructor and its associated User
#TODO: Get this cleaned up
@router.put("/instructors/update_with_user", response_model=CombinedInstructorUserOut)
async def update_instructor_and_user(
    instructor_id: Union[int, str],
    update_info: CombinedInstructorUserIn,
    db: Session = Depends(get_db)
):
    # Update the Instructor record first accordingly
    updated_instructor = await update_resource(
         model=Instructor,
         id=instructor_id,
         pydantic_in=update_info.instructor,
         db=db,
         idName="id"
    )
    if not updated_instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    user_id = updated_instructor.user_id
    if not user_id:
        raise HTTPException(status_code=400, detail="Instructor does not have an associated user")

    updated_user = await update_resource(
         model=User,
         id=user_id,
         pydantic_in=update_info.user,
         db=db,
         idName="id"
    )
    if not updated_user:
        raise HTTPException(status_code=404, detail="Associated user not found")

    return {"instructor": updated_instructor, "user": updated_user}


@router.put("/instructors/{instructor_id}/courses/visible", response_model=dict)
def make_all_courses_visible(instructor_id: int, db: Session = Depends(get_db)):
    """
    Make All Courses Visible Route

    This endpoint takes an instructor's ID as input and updates all courses associated with that instructor
    by setting their 'visibility' field to True. It returns a JSON response with a message and status indicating
    the outcome of the operation.

    Possible Responses:
    1. Success Response:
       - Message: "Courses updated successfully"
       - Status: "success"
       This response indicates that one or more courses were found for the given instructor and their visibility
       was successfully updated to True.

    2. Failure Response (No Courses Found):
       - Message: "No courses found for this instructor"
       - Status: "fail"
       This response indicates that there are no courses associated with the provided instructor ID,
       and therefore no update was performed.

    3. Error Response:
       - HTTP 500 Error with detail message "Failed to update courses: <error message>"
       This error response is returned when an exception occurs during the processing of the request.
       In this case, the transaction is rolled back and an HTTPException is raised with a 500 status code.

    Parameters:
    - instructor_id (int): The unique identifier of the instructor whose courses are to be updated.
    - db (Session): The database session obtained via dependency injection using get_db.

    Returns:
    - dict: A JSON object containing the outcome message and status.
    """
    try:
        # Query for all courses associated with the given instructor
        courses = db.query(Course).filter(Course.instructor_id == instructor_id).all()
        if not courses:
            return {"message": "No courses found for this instructor", "status": "fail"}
        # Set visibility to True for each course
        for course in courses:
            course.visibility = True
        db.commit()
        return {"message": "Courses updated successfully", "status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update courses: {str(e)}")
@router.get("/instructors/{instructor_id}/profile_completed", response_model=bool)
def check_instructor_profile_completion(instructor_id: int, db: Session = Depends(get_db)):
    """
    Check Instructor Profile Completion Status

    This endpoint checks if the instructor with the given ID has completed their profile.
    It does so by verifying the 'profileCompleted' field in the Instructor model.

    Possible Responses:
    1. True:
       - Indicates that the instructor's profile is complete (profileCompleted is True).
    2. False:
       - Indicates that the instructor's profile is incomplete (profileCompleted is False).
    3. HTTP 404 Error:
       - If no instructor is found with the given ID, a 404 error is returned with the detail "Instructor not found".

    Parameters:
    - instructor_id (int): The unique identifier of the instructor.
    - db (Session): The database session injected via dependency using get_db.

    Returns:
    - bool: True if the instructor's profile is complete, False otherwise.
    """
    instructor = db.query(Instructor).filter(Instructor.id == instructor_id).first()
    if instructor is None:
        raise HTTPException(status_code=404, detail="Instructor not found")
    if instructor.profileCompleted == None:
        return False
    return instructor.profileCompleted