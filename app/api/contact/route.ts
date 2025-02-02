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

		// Start email sending in background without awaiting
		const html = getContactFormEmailHTML(name, email, message);
		sendEmailService(
			"ilanmaouchi@gmail.com",
			"New Contact Form Submission",
			html
		).catch((error) =>
			console.error("Background email sending failed:", error)
		);

		// Respond immediately
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
