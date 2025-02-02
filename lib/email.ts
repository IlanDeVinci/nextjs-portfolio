"use server";

import { createTransport } from "nodemailer";
import myOAuth2Client from "./gauth";
import { googleEmailConfig } from "./types";

export const sendEmailService = async (
	to: string,
	subject: string,
	html: string
) => {
	try {
		myOAuth2Client.setCredentials({
			refresh_token: googleEmailConfig.refreshToken,
		});

		const accessToken = await myOAuth2Client.getAccessToken().catch((error) => {
			console.error("Failed to get access token:", error);
			throw new Error("Authentication failed");
		});

		if (!accessToken?.token) {
			throw new Error("No access token received");
		}

		const transportOptions = {
			service: "gmail",
			auth: {
				type: "OAuth2" as const,
				user: googleEmailConfig.email,
				clientId: googleEmailConfig.clientId,
				refreshToken: googleEmailConfig.refreshToken,
				accessToken: accessToken.token,
			},
		};
		const smtpTransport = createTransport(transportOptions);
		const mailOptions = {
			from: {
				name: "Portfolio",
				address: googleEmailConfig.email,
			},
			to,
			subject,
			html,
		};
		await smtpTransport.sendMail(mailOptions);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Email service error:", error.message);
		} else {
			console.error("Email service error:", String(error));
		}
		throw error;
	}
};
