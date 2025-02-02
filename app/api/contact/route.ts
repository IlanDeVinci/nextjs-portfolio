import { getContactFormEmailHTML } from "@/lib/utils";
import { sendEmailService } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { name, email, message } = await request.json();

		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const html = getContactFormEmailHTML(name, email, message);

		// Wait for email to be sent
		await sendEmailService(
			"ilanmaouchi@gmail.com",
			"New Contact Form Submission",
			html
		);

		return NextResponse.json({
			status: "OK",
			message: "Email sent successfully",
		});
	} catch (error) {
		console.error("Contact form error:", error);
		return NextResponse.json(
			{ error: "Failed to send email" },
			{ status: 500 }
		);
	}
}
