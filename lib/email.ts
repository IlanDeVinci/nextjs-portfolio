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

		const accessToken = await myOAuth2Client.getAccessToken();
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

		// Verify connection
		await new Promise((resolve, reject) => {
			smtpTransport.verify((error, success) => {
				if (error) {
					console.error("SMTP Connection Error:", error);
					reject(error);
				} else {
					console.log("SMTP Connection Ready");
					resolve(success);
				}
			});
		});

		const mailOptions = {
			from: {
				name: "Portfolio",
				address: googleEmailConfig.email,
			},
			to,
			subject,
			html,
		};

		// Send email with Promise
		const info = await new Promise((resolve, reject) => {
			smtpTransport.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.error("Email sending error:", error);
					reject(error);
				} else {
					resolve(info);
				}
			});
		});

		return info;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Email service error:", error.message);
		} else {
			console.error("Email service error:", String(error));
		}
		throw error;
	}
};
