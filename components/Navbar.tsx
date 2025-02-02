"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import cn from "classnames";

const navItems = ["Skills", "Studies", "Projects", "Experience", "Contact"];

const Navbar = () => {
	const [activeItem, setActiveItem] = useState("");
	const [isScrolled, setIsScrolled] = useState(false);
	const [, setScrollProgress] = useState(0);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		// Track scroll position
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
			const totalScroll =
				document.documentElement.scrollHeight - window.innerHeight;
			const currentProgress = (window.scrollY / totalScroll) * 100;
			setScrollProgress(currentProgress);
		};

		// Track active section
		const observerOptions = {
			rootMargin: "-50% 0px",
			threshold: 0,
		};

		const handleIntersect = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const sectionId = entry.target.id;
					setActiveItem(sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
				}
			});
		};

		const observer = new IntersectionObserver(handleIntersect, observerOptions);
		const sections = document.querySelectorAll("section[id]");
		sections.forEach((section) => observer.observe(section));

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			sections.forEach((section) => observer.unobserve(section));
		};
	}, []);

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3 }} // Faster initial animation
			className={cn(
				"fixed w-full z-50 transition-all duration-300",
				isScrolled
					? "bg-[#0f0628]/90 backdrop-blur-md shadow-lg"
					: "bg-transparent"
			)}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}>
						<Link
							href="/"
							className="font-space text-white font-bold text-xl">
							Portfolio
						</Link>
					</motion.div>

					{/* Mobile menu button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="md:hidden p-2 rounded-md text-purple-200 hover:text-white hover:bg-purple-500/10">
						<span className="sr-only">Open menu</span>
						{isMobileMenuOpen ? (
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						) : (
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>

					{/* Desktop navigation */}
					<div className="hidden md:flex space-x-1">
						{navItems.map((item) => (
							<motion.div
								key={item}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								<Link
									href={`#${item.toLowerCase()}`}
									className={cn(
										"relative px-4 py-2 rounded-full text-sm font-medium transition-colors font-manrope",
										activeItem === item
											? "text-white bg-purple-500/20"
											: "text-purple-200 hover:text-white hover:bg-purple-500/10"
									)}>
									{item}
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Mobile navigation */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="md:hidden bg-[#0f0628]/95 backdrop-blur-lg border-t border-purple-500/10">
						<div className="px-4 pt-2 pb-3 space-y-1">
							{navItems.map((item) => (
								<Link
									key={item}
									href={`#${item.toLowerCase()}`}
									onClick={() => setIsMobileMenuOpen(false)}
									className={cn(
										"block px-3 py-2 rounded-md text-base font-medium transition-colors",
										activeItem === item
											? "text-white bg-purple-500/20"
											: "text-purple-200 hover:text-white hover:bg-purple-500/10"
									)}>
									{item}
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
};

export default Navbar;
