from dateutil.rrule import rrulestr
from dateutil.parser import isoparse
from app.database_setup.models import TimeSlot

from datetime import datetime, timedelta

async def check_signup_alignment(signup, db):
    # Get the time slot
    time_slot = db.query(TimeSlot).filter(TimeSlot.id == signup.time_slot_id).first()
    if not time_slot.rrule_string or time_slot.flexible:
        return True
    try:
        start_time = signup.startTime
        end_time = signup.endTime

        #print(f"Signup start_time: {start_time}, Type: {type(start_time)}")
        #print(f"Signup end_time: {end_time}, Type: {type(end_time)}")

        return is_event_covered(time_slot.rrule_string, start_time, end_time)

    except Exception as e:
        #print(e)
        return True

def is_event_covered(rrule_string, start_time, end_time):
    """
    Checks if a specific event's start and end time is covered by the recurrence rule.

    :param rrule_string: RRULE string defining recurrence
    :param start_time: Start time of the event (datetime)
    :param end_time: End time of the event (datetime)
    :return: True if the event is covered by the recurrence, otherwise False
    """
    #print(f"Start time: {start_time}, Type: {type(start_time)}")
    #print(f"End time: {end_time}, Type: {type(end_time)}")

    # Ensure start_time and end_time are datetime objects
    if isinstance(start_time, str):
        start_time = isoparse(start_time)
    if isinstance(end_time, str):
        end_time = isoparse(end_time)

    #print("hi")
    rule = rrulestr(rrule_string, dtstart=start_time)
    for occurrence in rule:
        occurrence_end = occurrence + (end_time - start_time)
        if occurrence == start_time and occurrence_end == end_time:
            return True
        if occurrence > start_time:
            break

    return False
