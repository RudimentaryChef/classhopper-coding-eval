#Create
from app.database_setup.models import Instructor, TimeSlot
from app.classes.InstructorClasses import InstructorOut
from app.classes.UserClasses import UserOut
from app.classes.TimeSlotClasses import TimeSlotOut
from fastapi import APIRouter, Depends, HTTPException, status
from app.classes.CourseClasses import CourseIn, CourseOut, CourseSorter, CourseQuery, CourseCombinedIn
from app.database_setup.models import Course
from app.routes.CRUD_routes import get_all_records
from sqlalchemy.orm import Session
from typing import List
from app.services.course_services import courseSorterService, get_coordinates_from_address
from app.services.CRUD_services import get_multiple_criteria
import logging
from app.services.CRUD_services import create_resource, get_db, update_resource

router = APIRouter()
logger = logging.getLogger(__name__)
#TODO: Clean up these course routes
@router.post("/course/create", response_model=CourseOut)
async def create_course(course_in: CourseIn, db: Session = Depends(get_db)):
    """
    Creates a new course. If only an address is provided and latitude/longitude are missing,
    this endpoint will attempt to geocode the address to obtain the coordinates.

    Regardless of the geocoding outcome, the course is created.
    """
    try:
        if course_in.address and course_in.latitude is None and course_in.longitude is None:
            course_in.latitude, course_in.longitude = await get_coordinates_from_address(course_in.address)
    except Exception as e:
        # Log the error and continue with course creation even if geocoding fails
        #logger.error(f"Geocoding failed for address '{course_in.address}': {e}")
        print("Geocoding failed")
        print(e)
    finally:
        return create_resource(pydantic_in=course_in, db_model=Course, db=db)

#TODO: This funciton is disgusting and needs to be refactored
@router.post("/course/display/{num}", response_model=List[CourseOut])
async def find_courses(num: int, course_sorter: CourseSorter, db: Session = Depends(get_db)):
    try:
        courses = await get_all_records("Courses", db)
        #TODO this isn't super fast but its quick and easy

        courses = courseSorterService(course_sorter, courses)
        courses = courses[:num]

        course_out_list = []
        for course in courses:
            # Fetch instructor and join with User
            instructor = (
                db.query(Instructor)
                .filter(Instructor.id == course["instructor_id"])
                .first()
            )

            if instructor:
                user = instructor.user  # Assuming there's a relationship like `user = relationship("User")` in the Instructor model
                instructor_out = InstructorOut.from_orm(instructor)
                if user:
                    instructor_out.user = UserOut.from_orm(user)  # Convert ORM user to a UserOut instance
            else:
                instructor_out = None

            # Fetch timeslots
            time_slots = db.query(TimeSlot).filter(TimeSlot.course_id == course["course_ID"]).all()
            time_slots_out = [TimeSlotOut.from_orm(slot) for slot in time_slots]

            # Construct CourseOut object
            course_out = CourseOut(
                **course,
                instructor=instructor_out,
                time_slots=time_slots_out
            )
            course_out_list.append(course_out)

        return course_out_list
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course_by_id(course_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a course by its ID.
    """
    try:
        course = db.query(Course).filter(Course.course_ID == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        return course
    except Exception as e:
        # Optionally log the error here
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving the course: {str(e)}"
        )


@router.post("/courses/filter", response_model=List[CourseOut])
async def filter_courses(
        query: CourseQuery,
        db: Session = Depends(get_db),
):
    """
    Provide any optional fields (e.g. course_Name, description, instructor_id, etc.)
    to filter Courses. Only non-None fields are used as filter criteria.
    """
    # Convert the query to a dict and remove fields with None values

    criteria = {
         key: value
         for key, value in query.dict(exclude_unset=True).items()
         if value not in (None, "")
     }

    # Pass the cleaned-up criteria to a helper function to fetch the filtered courses
    records = await get_multiple_criteria(Course, db, criteria, multiple=True)
    return records

@router.put("/course/update", response_model=CourseOut)
async def update_course(
        course_id: str,
        course_in: CourseIn,
        db: Session = Depends(get_db)
):
    updated_course = await update_resource(
        model=Course,
        id=course_id,
        pydantic_in=course_in,
        db=db,
        idName="course_ID"
    )
    return updated_course

#You can use the time slot and course fetch functions

@router.post("/course/combined/create", response_model=CourseOut)
async def create_course_combined(course_in: CourseCombinedIn, db: Session = Depends(get_db)):
    """
    Creates a new course along with nested time slot (section) data.

    - If an address is provided but latitude/longitude are missing, it attempts to geocode the address.
    - The instructor is expected to already exist (referenced via instructor_id).
    - Time slots are provided in the JSON under the key "section" (mapped to time_slots).
    - The new course is committed first to generate its course_ID, which is then used for each time slot.

    If any part fails, the transaction is rolled back and an error is thrown.
    """
    try:
        # Geocode the address if needed
        if course_in.address and (course_in.latitude is None or course_in.longitude is None):
            course_in.latitude, course_in.longitude = await get_coordinates_from_address(course_in.address)

        # Create the base course record (exclude nested time_slots field)
        course_data = course_in.dict(exclude={"time_slots"}, exclude_unset=True)
        new_course = Course(**course_data)
        db.add(new_course)
        db.commit()  # Commit so that course_ID is generated
        db.refresh(new_course)

        # Now that new_course.course_ID is available, create nested time slots (sections)
        if course_in.time_slots:
            timeslot_objects = []
            for ts in course_in.time_slots:
                ts_data = ts.dict(exclude_unset=True)
                # Set the course_id for each time slot to the newly created course's ID
                ts_data['course_id'] = new_course.course_ID
                new_ts = TimeSlot(**ts_data)
                db.add(new_ts)
                timeslot_objects.append(new_ts)
            db.commit()  # Commit time slot records
            for ts in timeslot_objects:
                db.refresh(ts)
            # Optionally update the course's time_slots relationship
            new_course.time_slots = timeslot_objects
            db.add(new_course)
            db.commit()
            db.refresh(new_course)

        return new_course

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Course creation failed: {str(e)}")

