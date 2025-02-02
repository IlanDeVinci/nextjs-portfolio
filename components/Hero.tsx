"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import GridBackground from "./GridBackground";

const roles = [
	"Frontend Developer",
	"Backend Developer",
	"Full Stack Developer",
];

const Hero = () => {
	const [currentRole, setCurrentRole] = useState(0);
	const [dots, setDots] = useState("");
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		// Role rotation
		const roleInterval = setInterval(() => {
			setCurrentRole((prev) => (prev + 1) % roles.length);
		}, 4000); // Increased duration between role changes

		// Dots animation
		let count = 0;
		const dotsInterval = setInterval(() => {
			setDots(".".repeat((count % 3) + 1));
			count++;
		}, 600); // Slowed down dots animation

		// Mouse move handler
		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const { innerWidth, innerHeight } = window;

			// Calculate normalized mouse position (-1 to 1)
			const x = (clientX / innerWidth) * 2 - 1;
			const y = (clientY / innerHeight) * 2 - 1;

			setMousePosition({ x, y });
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			clearInterval(roleInterval);
			clearInterval(dotsInterval);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	const letterAnimation = {
		hidden: { opacity: 0, y: 20 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.05, // Reduced delay between letters
				duration: 0.6, // Increased duration
				ease: [0.4, 0, 0.2, 1], // Smooth easing
			},
		}),
	};

	return (
		<section className="min-h-[calc(100vh+4rem)] flex items-center justify-center relative py-20 sm:py-0">
			{" "}
			{/* Modified height and padding */}
			<GridBackground />
			<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
				{" "}
				{/* Adjusted padding and gap */}
				<div className="text-center md:text-left md:w-[60%] space-y-6">
					{" "}
					{/* Added space-y-6 */}
					<motion.div className="mb-4 md:mb-8">
						{" "}
						{/* Adjusted margin */}
						<motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
							{" "}
							{/* Responsive font sizes */}
							{/* Animate each letter of "Hi, I'm" */}
							<motion.span
								className="block mb-4"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8 }}>
								{"Hi, I'm".split("").map((char, index) => (
									<motion.span
										key={index}
										variants={letterAnimation}
										initial="hidden"
										animate="visible"
										custom={index}
										className="inline-block">
										{char === " " ? "\u00A0" : char}
									</motion.span>
								))}
							</motion.span>
							{/* Gradient animated name */}
							<motion.span
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.8,
									ease: [0.4, 0, 0.2, 1],
									delay: 0.5,
								}}
								className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text block mb-4">
								Ilan Maouchi{" "}
							</motion.span>
							{/* Smoother role animation */}
							<AnimatePresence mode="wait">
								<motion.div
									key={currentRole}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{
										duration: 1,
										ease: [0.4, 0, 0.2, 1],
										opacity: { duration: 0.5 },
									}}
									className="h-[1.2em] relative">
									<span className="animate-gradient-text text-2xl md:text-4xl inline-flex items-center">
										{roles[currentRole]}
										<motion.span
											className="w-6 text-purple-400 opacity-80"
											animate={{ opacity: [0.3, 1] }}
											transition={{
												repeat: Infinity,
												duration: 0.6,
												ease: "easeInOut",
											}}>
											{dots}
										</motion.span>
									</span>
								</motion.div>
							</AnimatePresence>
						</motion.h1>
					</motion.div>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							ease: [0.4, 0, 0.2, 1],
							delay: 1,
						}}
						className="text-xl md:text-2xl text-purple-200 mb-10 max-w-2xl">
						Creating amazing web experiences with modern technologies
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="relative">
						<Button
							size="lg"
							className="
				gradient-border-button
				bg-purple-950 text-white px-12 py-8 text-lg
				transition-all duration-300
				hover:bg-purple-950 hover:scale-110
				group
			  "
							onClick={() => {
								document
									.getElementById("projects")
									?.scrollIntoView({ behavior: "smooth" });
							}}>
							<span className="relative z-10 font-semibold">
								Explore My Work
							</span>
						</Button>
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="w-[80%] sm:w-[60%] md:w-[40%] max-w-[300px] md:max-w-[400px]">
					{" "}
					<div className="relative aspect-square">
						<motion.div
							className="absolute inset-0 rounded-full border-4 border-purple-500/30 overflow-hidden shadow-2xl"
							animate={{
								x: window.innerWidth > 768 ? mousePosition.x * 50 : 0,
								y: window.innerWidth > 768 ? mousePosition.y * 20 : 0,
								rotateX: window.innerWidth > 768 ? mousePosition.y * 10 : 0,
								rotateY: window.innerWidth > 768 ? -mousePosition.x * 10 : 0,
							}}
							transition={{
								type: "tween",
								damping: 15,
								stiffness: 150,
							}}>
							<Image
								src="/profile.jpg"
								alt="Profile"
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								className="object-cover object-center"
								priority
							/>
						</motion.div>
						<motion.div
							className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-transparent rounded-full"
							animate={{
								x: window.innerWidth > 768 ? mousePosition.x * 50 : 0,
								y: window.innerWidth > 768 ? mousePosition.y * 20 : 0,
								rotateX: window.innerWidth > 768 ? mousePosition.y * 10 : 0,
								rotateY: window.innerWidth > 768 ? -mousePosition.x * 10 : 0,
							}}
							transition={{
								type: "tween",
								damping: 15,
								stiffness: 150,
							}}
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Hero;
