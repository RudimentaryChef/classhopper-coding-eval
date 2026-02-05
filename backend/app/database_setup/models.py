from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, DECIMAL, ForeignKey, JSON, Table, Date, Index, event
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database_setup.db import Base, engine

# Association tables

user_courses_association = Table(
    'user_courses',
    Base.metadata,
    Column('user_id', String(255), ForeignKey('users.id'), primary_key=True),
    Column('course_id', Integer, ForeignKey('courses.course_ID'), primary_key=True)
)

# Models
class Organization(Base):
    __tablename__ = 'organization'

    id = Column(Integer, primary_key=True, autoincrement=True)
    rating = Column(Integer)
    description = Column(String(3000))
    name = Column(String(255))
    pfp_link = Column(String(255))
    image1_link = Column(String(255))

    courses = relationship("Course", back_populates="organization")


class Instructor(Base):
    __tablename__ = 'instructor'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('users.id'))
    rating = Column(Integer)
    description = Column(String(3000))
    pfp_link = Column(String(255))
    website_link = Column(String(255))
    phone_number = Column(String(20))
    street_address = Column(String(255))
    stripeConnectedLinked = Column(Boolean, default=False)
    profileCompleted = Column(Boolean, default=False)
    stripeConnectedId = Column(String(255), nullable=True)
    payment_method = Column(String(255))
    user = relationship("User", back_populates="instructors")
    courses = relationship("Course", back_populates="instructor")


class Course(Base):
    __tablename__ = 'courses'

    course_ID = Column(Integer, primary_key=True, autoincrement=True)
    course_Name = Column(String(255))
    address = Column(String(255))
    description = Column(String(2000))
    form_Link = Column(String(255))
    image_1_Link = Column(String(255))
    image_2_Link = Column(String(255))
    image_3_Link = Column(String(255))
    online = Column(Boolean, default=False)
    course_Price = Column(DECIMAL)
    signup_Form_Link = Column(String(255))
    course_Rating = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    instructor_id = Column(Integer, ForeignKey('instructor.id'))
    organization_ID = Column(Integer, ForeignKey('organization.id'))
    tag_1 = Column(String(255))
    tag_2 = Column(String(255))
    tag_3 = Column(String(255))
    phone = Column(String(255))
    website = Column(String(255))

    minimum_age = Column(Integer)
    visibility = Column(Boolean, default=True)
    flexible = Column(Boolean, default=False)
    trialClass = Column(Boolean, default=False)

    instructor = relationship("Instructor", back_populates="courses")
    organization = relationship("Organization", back_populates="courses")

    time_slots = relationship(
        'TimeSlot',
        back_populates='courses',
        cascade="all, delete-orphan"
    )

    saved_by_users = relationship(
        "User",
        secondary=user_courses_association,
        back_populates="saved_courses"
    )

    signups = relationship("Signup", back_populates="course")


class User(Base):
    __tablename__ = 'users'
    id = Column(String(255), primary_key=True)
    external_id = Column(String(255))
    username = Column(String(255))
    first_name = Column(String(255))
    last_name = Column(String(255))
    gender = Column(String(51))
    birthday = Column(Date)
    email = Column(String(255))
    name = Column(String(255))
    guardian_id = Column(String(255), ForeignKey('users.id'))
    guardian_email = Column(String(255))
    address = Column(String(255))
    default_longitude = Column(Float)
    default_latitude = Column(Float)
    phone_number = Column(String(30))
    password_enabled = Column(Boolean)
    image_url = Column(String(1000))
    profile_image_url = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_sign_in_at = Column(DateTime(timezone=True))
    primary_phone_number_id = Column(String(255))
    guardian = relationship("User", remote_side=[id], back_populates="dependents")
    dependents = relationship("User", back_populates="guardian", foreign_keys=[guardian_id])
    saved_courses = relationship("Course", secondary=user_courses_association, back_populates="saved_by_users")
    signups = relationship("Signup", back_populates="user")
    instructors = relationship(
        "Instructor",
        back_populates="user",
        passive_deletes=True
    )


class TimeSlot(Base):
    __tablename__ = 'time_slots'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(2555))
    spots = Column(Integer, default=0)
    dtstart = Column(DateTime(timezone=True))
    dtend = Column(DateTime(timezone=True))
    rrule_string = Column(String(2000))
    exdates = Column(JSON, default=[])
    rdates = Column(JSON, default=[])
    visible = Column(Boolean, default=True)
    flexible = Column(Boolean, default=True)
    course_id = Column(
        Integer,
        ForeignKey('courses.course_ID', ondelete='CASCADE'),
        nullable=False
    )
    duration = Column(Integer)

    courses = relationship('Course', back_populates='time_slots')
    signups = relationship("Signup", back_populates="time_slot")


class Signup(Base):
    __tablename__ = 'signups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('users.id'))
    course_id = Column(Integer, ForeignKey('courses.course_ID'))
    time_slot_id = Column(Integer, ForeignKey('time_slots.id', ondelete="CASCADE"))
    quantity = Column(Integer)
    student_name = Column(String(255))
    startTime = Column(DateTime, server_default=func.now())
    endTime = Column(DateTime, server_default=func.now())
    valid = Column(Boolean)
    user = relationship("User", back_populates="signups")
    course = relationship("Course", back_populates="signups")
    time_slot = relationship("TimeSlot", back_populates="signups")
    transaction_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    price_paid = Column(Float)


class Dependent(Base):
    __tablename__ = 'dependents'
    dep_id = Column(Integer, primary_key=True, autoincrement=True)
    guardian_id = Column(String(255), ForeignKey('users.id'))
    name = Column(String(255))
    age = Column(Integer)
    guardian = relationship("User")

class Contact(Base):
    __tablename__ = 'contact_info'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)


# Create tables
Base.metadata.create_all(engine, checkfirst=True)
