import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { TimeSlot } from "@/app/types";

declare const Tally: any;
interface SubmissionPayload {
	id: string; // submission ID
	respondentId: string;
	formId: string;
	formName: string;
	createdAt: Date; // submission date
	fields: Array<{
		id: string;
		title: string;
		type:
		| "INPUT_TEXT"
		| "INPUT_NUMBER"
		| "INPUT_EMAIL"
		| "INPUT_PHONE_NUMBER"
		| "INPUT_LINK"
		| "INPUT_DATE"
		| "INPUT_TIME"
		| "TEXTAREA"
		| "MULTIPLE_CHOICE"
		| "DROPDOWN"
		| "CHECKBOXES"
		| "LINEAR_SCALE"
		| "FILE_UPLOAD"
		| "HIDDEN_FIELDS"
		| "CALCULATED_FIELDS"
		| "RATING"
		| "MULTI_SELECT"
		| "MATRIX"
		| "RANKING"
		| "SIGNATURE"
		| "PAYMENT";
		answer: { value: any; raw: any };
	}>;
}

type Props = {
	tallyID: string;
	courseName: string;
	meetingtime?: TimeSlot | null;
	course_id?: number;
};

const TallyEmbed = ({ tallyID, courseName, meetingtime, course_id }: Props) => {
	useEffect(() => {
		if (typeof Tally !== "undefined") {
			Tally.loadEmbeds();
		}

		if (typeof window !== "undefined") {
			window.addEventListener("message", handleMessage);
		}

		async function handleMessage(e: MessageEvent) {
			if (
				typeof e.data === "string" &&
				e.data.includes("Tally.FormSubmitted")
			) {
				const payload = JSON.parse(e.data).payload as SubmissionPayload;
				const user_id = localStorage.getItem("ajs_user_id");
				// console.log(meetingtime, course_id)

				// await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/signup/create`, {
				// 	user_id: user_id,
				// 	course_id: course_id,
				// 	time_slot_id: meetingtime?.id,
				// 	submission_id: payload.id,
				// 	respondent_id: payload.respondentId,
				// 	student_name: payload.fields[0].answer.value,
				// })

				// const res = await axios.post("/api/send", {
				// 	...payload,
				// 	courseName,
				// });
				// console.log(res);
			}
		}

		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("message", handleMessage);
			}
		};
	}, []);

	return (
		<>
			<iframe
				data-tally-src={`https://tally.so/embed/${tallyID}?name=Bobby&alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
				loading="lazy"
				width="100%"
				height="319"
				// @ts-ignore
				frameborder="0"
				marginheight="0"
				marginwidth="0"
				title="Business Registration Form"
			></iframe>
			<script async src="https://tally.so/widgets/embed.js"></script>
		</>
	);
};

export default TallyEmbed;
