"use client";

import Link from "next/link";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Custom404() {
	useEffect(() => {
		document.title = "404 - Page Not Found";
	}, []);

	return (
		<>
			<Navbar />
			<div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[#0f0628] text-white">
				<h1 className="text-6xl font-bold mb-4">404</h1>
				<h2 className="text-2xl mb-8">Oops! Page not found</h2>
				<p className="mb-8">
					The page you&apos;re looking for doesn&apos;t seem to exist.
				</p>
				<Link
					href="/"
					className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
					Return Home
				</Link>
			</div>
			<Footer />
		</>
	);
}
