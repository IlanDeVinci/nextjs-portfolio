"use server";

import { createTransport } from "nodemailer";
import { googleEmailConfig } from "./types";

export const sendEmailService = async (
	to: string,
	subject: string,
	html: string
) => {
	const transport = createTransport({
		service: "gmail",
		auth: {
			user: googleEmailConfig.email,
			pass: googleEmailConfig.googleAppPassword,
		},
	});

	try {
		const info = await transport.sendMail({
			from: googleEmailConfig.email,
			to,
			subject,
			html,
		});
		return info;
	} catch (error) {
		console.error("Email error:", error);
		throw error;
	}
};
