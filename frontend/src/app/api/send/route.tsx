import { Resend } from "resend";

interface EmailTemplateProps {
	firstName: string;
	courseName: string;
}

const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
	firstName,
	courseName,
}) => (
	<div>
		<p>Hi {firstName},</p>
		<p>Thanks for signing up for {courseName}!</p>
	</div>
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	const res = await request.json();
	console.log(res);
	const userEmail = res.fields.find(
		(field: any) => field.title.toLowerCase().includes("name")
	).answer.value;
	const studentName = res.fields.find(
		(field: any) => field.title.toLowerCase().includes("name")
	).answer.value;
	const courseName = res.courseName;

	// console.log(res);

	if (!userEmail || !res) {
		return Response.json({ error: "bad request" }, { status: 400 });
	}

	try {
		const { data, error } = await resend.emails.send({
			from: "Classhopper <notifications@classhopper.org>",
			to: [
				"rishithra2006@gmail.com",
				"adikrish6824@gmail.com",
				userEmail,
			],
			subject: "Hello world",
			react: (
				<EmailTemplate
					firstName={studentName}
					courseName={courseName}
				/>
			),
		});

		if (error) {
			return Response.json({ error }, { status: 500 });
		}

		return Response.json(data);
	} catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}
