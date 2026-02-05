import axios from "axios";
import { RRule, rrulestr } from "rrule";
import { toast } from "sonner";
import { ClassTime, TimeSlot } from "../types";
// import { ClassInfo } from "../types";

export async function handleLocationClick(): Promise<[number, number]> {
	if (!navigator.geolocation) {
		console.log("Geolocation not supported");
		throw new Error("Geolocation not supported");
	}

	console.log("Geolocation supported, attempting to get current position");

	return new Promise<[number, number]>((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position: GeolocationPosition) => {
				console.log("Position retrieved");
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				resolve([latitude, longitude]);
			},
			(error) => {
				console.log("Error retrieving position", error);
				reject(new Error("Unable to retrieve your location"));
			}
		);
	});
}

export function formatPhoneNumber(input: string): string {
	if (!input) return ""; // Ignore empty input

	// Remove all non-digit characters from the input
	const cleanedInput = input.replace(/\D/g, "");

	// Check if the cleaned input is 11 digits and starts with '1' (country code)
	const isCountryCodePresent = cleanedInput.length === 11 && cleanedInput.startsWith("1");

	// Normalize the input: remove the leading '1' only if it's part of a country code
	const normalizedInput = isCountryCodePresent ? cleanedInput.slice(1) : cleanedInput;

	// Check if the normalized input is a valid 10-digit number
	if (normalizedInput.length !== 10 || !/^\d{10}$/.test(normalizedInput)) {
		return "invalid"; // Ignore invalid input
	}

	// Format the normalized input as +1-XXX-XXX-XXXX
	return `+1 ${normalizedInput.slice(0, 3)}-${normalizedInput.slice(3, 6)}-${normalizedInput.slice(7)}`;
}

export function formatTime(input: string): string {
	if (!input) return ""; // Ignore empty
	input = input.toUpperCase().replace(/\s+/g, ""); // Normalize input
	let period = "";

	// Extract AM/PM if present
	if (input.endsWith("AM") || input.endsWith("PM")) {
		period = input.slice(-2); // Get "AM" or "PM"
		input = input.slice(0, -2); // Remove AM/PM from input
	} else if (input.endsWith("A") || input.endsWith("P")) {
		period = input.endsWith("A") ? "AM" : "PM";
		input = input.slice(0, -1); // Remove A/P
	}

	let hours, minutes;

	if (/^\d{1,4}$/.test(input)) {
		// Handle formats like 5, 515
		if (input.length <= 2) {
			hours = parseInt(input, 10);
			minutes = 0;
		} else {
			hours = parseInt(input.slice(0, -2), 10);
			minutes = parseInt(input.slice(-2), 10);
		}
	} else if (/^\d{1,2}:\d{2}$/.test(input)) {
		// Handle formats like 5:15, 12:45
		[hours, minutes] = input.split(":").map(Number);
	} else {
		return "def"; // Ignore invalid formats
	}

	if (hours < 1 || hours > 12 || minutes >= 59) return "def"; // Ignore invalid times

	if (!period) period = hours !== 12 ? "PM" : "AM"; // Default to PM unless explicitly set

	return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function timeDifference(start: string, end: string): number {
	function parseTime(time: string): number {
		if (time === "def") return NaN; // Invalid input handling

		const [hourPart, minutePart] = time.split(" ");
		let [hours, minutes] = hourPart.split(":").map(Number);
		const period = minutePart; // "AM" or "PM"

		// Convert to 24-hour format
		if (period === "PM" && hours !== 12) hours += 12;
		if (period === "AM" && hours === 12) hours = 0;

		return hours * 60 + minutes; // Total minutes since midnight
	}

	const startMinutes = parseTime(start);
	const endMinutes = parseTime(end);

	if (isNaN(startMinutes) || isNaN(endMinutes)) return NaN; // Handle invalid input

	let diff = endMinutes - startMinutes;
	if (diff < 0) diff += 1440; // Adjust for crossing midnight

	return diff;
}


export function getNextMonthDate(date = new Date()): Date {
	try {
		let nextMonthDate = new Date(date);
		let currentDay = nextMonthDate.getDate();

		// Set to next month
		nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

		// Handle overflow by checking if the month advanced correctly
		if (nextMonthDate.getDate() !== currentDay) {
			// Set to the last valid day of the new month
			nextMonthDate.setDate(0);
		}

		return nextMonthDate;
	} catch (error) {
		console.error("Error calculating next month's date:", error);
		return date;
	}
}

export function formatImgLink(img: string): string {
	return encodeURI('https://storage.googleapis.com/imagestorageclasshopper/' + img);
}

export function convertToLocal(utcTimestamp: Date, offset: number) {
	const date = new Date(utcTimestamp);
	return new Date(date.getTime() - (offset * 60 * 1000));
}

export function getMinutesDifference(d1: Date, d2: Date): number {
	const minutes1 = d1.getUTCHours() * 60 + d1.getUTCMinutes();
	const minutes2 = d2.getUTCHours() * 60 + d2.getUTCMinutes();

	return Math.abs(minutes2 - minutes1);
}

export function minsToHours(mins: number): string {
	const hours = Math.floor(mins / 60);
	const minutes = mins % 60;
	return `${hours}h ${minutes}m`;
}

export function parseCourseDetails(data: any) {
	data.section.map((section: any) => {
		if (!section.flexible) {
			section.dtstart = new Date(section.dtstart + "Z")
			section.dtend = new Date(section.dtend + "Z")
		}

		if (section.rrule_string) {
			section.rrule = rrulestr(section.rrule_string)
		}
	})

	return data
}

export function generateUpcomingClassDates(sections: TimeSlot[], limit = 10): ClassTime[] {
	const now = new Date();
	const result = [];

	for (const slot of sections) {
		// Skip slots without required scheduling information
		if (!slot.rrule || !slot.dtstart || slot.flexible) continue;

		try {
			// Instead of calculating duration in milliseconds, store the original hour/minute
			// information for both start and end times
			const startHour = slot.dtstart.getHours();
			const startMinute = slot.dtstart.getMinutes();

			// Get the hours and minutes for end time if available
			let endHour = startHour + (slot.duration || 2); // Default: 2 hours later
			let endMinute = startMinute;

			if (slot.dtend) {
				endHour = slot.dtend.getHours();
				endMinute = slot.dtend.getMinutes();
			}

			// Get recurrence dates from rrule
			const occurrences = slot.rrule.between(
				now,
				slot.dtend ? new Date(slot.dtend) : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
				true
			);

			// Process each occurrence to preserve the original local time
			for (const date of occurrences) {
				// Create a new date object for the start time
				const startDate = new Date(date);
				startDate.setHours(startHour, startMinute, 0, 0);

				// Create a new date object for the end time on the same day
				const endDate = new Date(date);
				endDate.setHours(endHour, endMinute, 0, 0);

				// Handle case where end time is on the next day
				if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
					endDate.setDate(endDate.getDate() + 1);
				}

				result.push({
					original: {
						id: slot.id,
						course_id: slot.course_id,
						description: slot.description,
						seats: slot.spots,
						flexible: slot.flexible
					},
					startTime: startDate,
					endTime: endDate
				});
			}
		} catch (error) {
			console.error('Error processing time slot:', error, slot);
		}
	}

	// Sort all dates chronologically
	return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
		.slice(0, limit).map((x) => {
			return {
				id: x.original.id ?? 0,
				course_id: x.original.course_id ?? 0,
				seats: x.original.seats ?? 0,
				flexible: x.original.flexible,
				description: x.original.description,
				startTime: x.startTime.toUTCString(),
				endTime: x.endTime.toUTCString()
			}
		});
}
