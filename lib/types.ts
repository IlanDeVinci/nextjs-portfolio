import dotenv from "dotenv";
dotenv.config();

type GOOGLE_MAIL_SERVICE_KEYS =
	| "clientId"
	| "clientSecret"
	| "refreshToken"
	| "redirectUri"
	| "email"
	| "googleAppPassword";

export const googleEmailConfig = {
	email: process.env.GOOGLE_EMAIL!,
	googleAppPassword: process.env.GOOGLE_APP_PASSWORD!,
} as const;

if (!googleEmailConfig.email || !googleEmailConfig.googleAppPassword) {
	throw new Error("Missing email configuration");
}
