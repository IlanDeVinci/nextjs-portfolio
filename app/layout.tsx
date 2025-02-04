import type { Metadata } from "next";
import {
	Geist,
	Azeret_Mono as Geist_Mono,
	Space_Grotesk,
	Manrope,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
});
const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});
const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space",
	display: "swap",
});

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Ilan's Portfolio | Full Stack Developer",
		template: "%s | Ilan's Portfolio",
	},
	description:
		"Full Stack Developer specializing in React, Next.js, and modern web technologies. Explore my projects, skills, and professional experience.",
	keywords: [
		"Full Stack Developer",
		"React",
		"Next.js",
		"Web Development",
		"Software Engineer",
		"Portfolio",
		"JavaScript",
		"TypeScript",
	],
	authors: [{ name: "Ilan" }],
	creator: "Ilan",
	publisher: "Ilan",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://your-domain.com",
		siteName: "Ilan's Portfolio",
		title: "Ilan's Portfolio | Full Stack Developer",
		description:
			"Full Stack Developer specializing in React, Next.js, and modern web technologies.",
		images: [
			{
				url: "https://your-domain.com/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Ilan's Portfolio",
			},
		],
	},
	verification: {
		google: "your-google-verification-code",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${spaceGrotesk.variable} ${manrope.variable}`}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-purple-900 text-white overflow-x-hidden`}>
				<div className="relative min-h-screen overflow-hidden">{children}</div>
			</body>
		</html>
	);
}
