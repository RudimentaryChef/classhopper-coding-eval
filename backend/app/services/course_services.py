import math
import os
import random
from decimal import Decimal
from app.classes.CourseClasses import CourseIn,CourseBase,CourseSorter,CourseOut
from typing import List, Optional
from fastapi import HTTPException
import httpx
from app.database_setup.models import Course
def haversineDistance(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    """
    Calculate the great circle distance between two points on the Earth (specified in decimal degrees).
    Returns the distance in miles. Using the haversine distance formula
    """
    R = 3959.0  # Earth radius in miles
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
#get time slot for courses

#get instructor for courses

def courseSorterService(course_sorter: CourseSorter,courses: List[Course]) -> List[Course]:
    """

    :param course_sorter:
    :param courses:
    :return: a list of Courses sorted accordingly
    """
    #TODO: This method needs a bit of work. Since doing in python is slower
    courses = [course for course in courses if course.get("visibility", True)]
    if course_sorter.class_type== "online":
        courses = [course for course in courses if course["online"] == True]
    elif course_sorter.class_type == "in_person":
        courses = [course for course in courses if course["online"] == False]
    key_field: Optional[str] = None
    #add the location/distance for everything IF it exists. Otherwise make it be infinite.

    #check if we have been provided long and lat
   # print(course_sorter.longitude and course_sorter.latitude)
    if(course_sorter.longitude is not None and course_sorter.latitude is not None):
        #if we have then compute distance for everything regardless

        for course in courses:
            distance = None
            if course["latitude"] is not None and course["longitude"] is not None:
                distance = haversineDistance(course["longitude"],course["latitude"], course_sorter.longitude,course_sorter.latitude)
                #print(distance)
                course["distance"] = distance
    if course_sorter.by == "location":
        key_field = "distance"
    elif course_sorter.by == "rating":
        key_field = "course_Rating"
    elif course_sorter.by == "price":
        key_field = "course_Price"
    else:
        key_field = None
    filtered_courses = []
    #got to sort it like this
    if key_field:
        filtered_courses = []
        for course in courses:
            key_value = course[key_field]
            #print(key_value)
            if key_value is None or course_sorter.greaterThan <= key_value <= course_sorter.lessThan:
                filtered_courses.append(course)



        reverse_sort = True if course_sorter.sorted == "desc" else False
        filtered_courses.sort(
            key=lambda course: (-float('inf') if reverse_sort else float('inf')) if course[key_field] is None else course[key_field],
            reverse=reverse_sort
        )



    else:
        if courses:
            filtered_courses = random.sample(courses, len(courses))
    return filtered_courses


#def addandcalculateLocation()

#def

#TODO: change the API Key location so its mores secure
async def get_coordinates_from_address(address: str, google_api_key: str = None) -> tuple[float, float]:
    # Use environment variable if no key provided
    if google_api_key is None:
        google_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    """
    Uses the Google Geocoding API to convert an address into latitude and longitude.

    Args:
        address (str): The address to geocode.
        google_api_key (str): Your Google API key.

    Returns:
        tuple[float, float]: A tuple containing (latitude, longitude).

    Raises:
        HTTPException: If the address could not be geocoded.
    """
    params = {"address": address, "key": google_api_key}
    geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"

    async with httpx.AsyncClient() as client:
        response = await client.get(geocode_url, params=params)

    data = response.json()
    if data.get("status") == "OK" and data.get("results"):
        location = data["results"][0]["geometry"]["location"]
        return location.get("lat"), location.get("lng")
    else:
        raise HTTPException(
            status_code=400,
            detail="Could not geocode the provided address."
        )
