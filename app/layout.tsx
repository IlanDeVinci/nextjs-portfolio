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
	title: "My Portfolio",
	description: "A showcase of my skills and projects",
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
