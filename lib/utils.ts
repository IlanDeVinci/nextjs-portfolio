import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { sendEmailService } from "./email";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getEmailHTML = (title: string, subtitle: string): string => `<html>
<head>
    <title>${title}</title>
</head>
<body>
    <h1>${title}</h1>
    <p>${subtitle}</p>
</body>
</html>`;

export const getContactFormEmailHTML = (
	name: string,
	email: string,
	message: string
): string => `
<html>
<head>
    <title>New Contact Form Submission</title>
</head>
<body>
    <h1>New Contact Form Submission</h1>
    <h2>From: ${name}</h2>
    <h3>Email: ${email}</h3>
    <div style="margin-top: 20px;">
        <h3>Message:</h3>
        <p>${message}</p>
    </div>
</body>
</html>`;

export const sendEmail = async (to: string, subject: string) => {
	const html = getEmailHTML(subject, "This is a test email");
	await sendEmailService(to, subject, html);
};
