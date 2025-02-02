"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Studies from "@/components/Studies";
import Projects from "@/components/Projects";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import ParticlesComponent from "@/components/Particles";
import TextureBackground from "@/components/TextureBackground";
import TextureBackground2 from "@/components/TextureBackground2";
import TerminalExperience from "@/components/TerminalExperience";
import CursorTrail from "@/components/CursorTrail";
import ParticleBackground from "@/components/ParticleBackground";

export default function Page() {
	const [isLoading, setIsLoading] = useState(true);
	const [activeSection, setActiveSection] = useState("hero");

	// Handle loading state
	useEffect(() => {
		setIsLoading(false);
	}, []);

	// Track scroll progress with throttling
	useEffect(() => {
		const handleScroll = () => {
			// Using Intersection Observer instead of scroll events
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							setActiveSection(entry.target.id);
						}
					});
				},
				{
					rootMargin: "-50% 0px",
					threshold: 0,
				}
			);

			document.querySelectorAll("section[id]").forEach((section) => {
				observer.observe(section);
			});

			return () => observer.disconnect();
		};

		handleScroll();
	}, []);

	// Smooth scroll handler
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<AnimatePresence mode="wait">
			{isLoading ? (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]">
					<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500/50"></div>
				</motion.div>
			) : (
				<motion.main
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="relative min-h-screen bg-[#0f0628] overflow-x-hidden">
					<CursorTrail />
					<ParticlesComponent />

					<div className="relative">
						<Navbar />
						<section
							id="hero"
							className="min-h-screen relative overflow-hidden">
							<ParticleBackground />
							<Hero />
						</section>
						<TextureBackground />
						<div className="relative">
							<section
								id="skills"
								className="min-h-screen py-8 md:py-16">
								{" "}
								{/* Reduced padding */}
								<Skills />
							</section>
						</div>
						<div className="relative overflow-hidden -mt-32">
							{" "}
							{/* Added negative margin to pull section up */}
							<TextureBackground2 />
							<section
								id="studies"
								className="relative z-10">
								<Studies />
							</section>
						</div>
						<section
							id="projects"
							className="relative z-10">
							<Projects />
						</section>
						<section
							id="experience"
							className="relative z-11 min-h-screen py-16">
							<TerminalExperience />
						</section>
						<section
							id="contact"
							className="relative z-10">
							<ContactForm />
						</section>
						<Footer />
					</div>
				</motion.main>
			)}
		</AnimatePresence>
	);
}
