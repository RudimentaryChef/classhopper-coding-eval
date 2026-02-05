// export type ClassInfo = {
// 	courseID: string;
// 	courseName: string;
// 	courseDescription: string;
// 	thumbnailLink?: string;
// 	imageOne?: string;
// 	price: number;
// 	rating: number;
// 	distance: number;
// 	signupForm: string;
// };

import { RRule } from "rrule";

export type CourseDetails = {
	address: string;
	description: string;
	course_Name: string;
	form_Link: string | null;
	image_1_Link: string;
	image_2_Link: string;
	image_3_Link: string | null;
	course_Price: string;
	// signup_Form: string | null;
	rating: number | null;
	latitude: number | null;
	longitude: number | null;
	instructor: Instructor;
	instructor_ID: string;
	organization_ID: string | null;
	tag_1: string | null;
	tag_2: string | null;
	tag_3: string | null;
	phone: string | null;
	website: string | null;
	course_ID: number;
	flexible: boolean;
	distance: number | null;
	location?: string | null;
	section: TimeSlot[]
	online: boolean;
	minimum_age: number
};

type Instructor = {
	name: string;
	description: string;
	rating: number;
	id: number;
	phone_number: string;
	pfp_link: string;
	image1_link: string;
	stripeConnectedLinked: boolean;
	stripeConnectedId: string;
	street_address: string;
	payment_method: string;
}

type TimeRange = {
	id: number;
	day_of_week: number;
	start_time: string;
	end_time: string;
}

export type TimeSlot = {
	id?: number;
	course_id?: number;
	description: string;
	duration?: number;
	spots?: number;
	rrule?: RRule;
	dtstart?: Date;
	dtend?: Date;
	rdates?: string[];
	flexible: boolean;
}

export type User = {
	id: string;
	externalId: string | null;
	username: string | null;
	first_name: string;
	last_name: string;
	gender: string | null;
	birthday: string;
	email: string;
	name: string | null;
	guardianId: string | null;
	guardianEmail: string | null;
	address: string | null;
	defaultLongitude: number | null;
	defaultLatitude: number | null;
	phoneNumber: string | null;
	passwordEnabled: boolean;
	imageUrl: string;
	profileImageUrl: string;
	createdAt: string;
	updatedAt: string;
	lastSignInAt: string | null;
	primaryPhoneNumberId: string | null;
}

export type UserInstructor = {
	user: User;
	instructor: Instructor;
}

export type ClassTime = {
	id: number;
	course_id: number;
	seats: number;
	description: string;
	startTime: string;
	endTime: string;
	flexible: boolean;
	quantity?: number;
}
