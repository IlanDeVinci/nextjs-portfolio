"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconType } from "react-icons";
import { FaReact, FaNodeJs, FaGithub, FaFigma } from "react-icons/fa";
import {
	SiNextdotjs,
	SiTypescript,
	SiGraphql,
	SiTailwindcss,
	SiPostgresql,
	SiMysql,
	SiSass,
	SiSymfony,
	SiVite,
	SiAdobeaftereffects,
	SiAdobephotoshop,
	SiHtml5,
	SiCss3,
	SiDotnet,
	SiPrisma,
	SiExpress,
	SiPostman,
	SiWordpress,
	SiPython,
} from "react-icons/si";
import { DiJava } from "react-icons/di";
import { DiUnitySmall } from "react-icons/di";

import { VscCode } from "react-icons/vsc";
import { useState } from "react";
import cn from "classnames";

// Define types
interface Skill {
	name: string;
	icon: IconType;
	description: string;
}

interface SkillCategories {
	Languages: Skill[];
	Frontend: Skill[];
	Backend: Skill[];
	Tools: Skill[];
	Creative: Skill[];
}

const skillsByCategory: SkillCategories = {
	Languages: [
		{
			name: "TypeScript",
			icon: SiTypescript,
			description:
				"Strong typing and enhanced development experience with TypeScript",
		},
		{
			name: "Python",
			icon: SiPython,
			description: "Python development for automation and backend services",
		},
		{
			name: "HTML",
			icon: SiHtml5,
			description: "Semantic HTML markup and modern web standards",
		},
		{
			name: "CSS",
			icon: SiCss3,
			description: "Advanced CSS styling, animations, and responsive design",
		},
		{
			name: "Sass",
			icon: SiSass,
			description: "CSS preprocessing with Sass for maintainable stylesheets",
		},
	],
	Frontend: [
		{
			name: "React",
			icon: FaReact,
			description:
				"3+ years of experience building dynamic UIs with React, including custom hooks, context, and advanced state management",
		},
		{
			name: "Next.js",
			icon: SiNextdotjs,
			description:
				"Expert in building full-stack applications with Next.js, utilizing SSR/SSG, API routes, and the App Router",
		},
		{
			name: "Tailwind",
			icon: SiTailwindcss,
			description:
				"Proficient in rapid UI development with Tailwind CSS, custom configurations, and responsive design",
		},
		{
			name: "WordPress",
			icon: SiWordpress,
			description: "Custom theme development and content management systems",
		},
	],
	Backend: [
		{
			name: "Node.js",
			icon: FaNodeJs,
			description:
				"Strong experience in building scalable server-side applications and REST APIs with Node.js",
		},
		{
			name: "Express",
			icon: SiExpress,
			description: "Building REST APIs and web applications with Express.js",
		},
		{
			name: ".NET",
			icon: SiDotnet,
			description: "Enterprise-level applications with .NET framework",
		},
		{
			name: "Symfony",
			icon: SiSymfony,
			description: "PHP framework for robust web applications",
		},
	],
	Tools: [
		{
			name: "Git",
			icon: FaGithub,
			description:
				"Version control and collaborative development using Git and GitHub",
		},
		{
			name: "VS Code",
			icon: VscCode,
			description: "Lightweight, extensible code editor for modern development",
		},
		{
			name: "Postman",
			icon: SiPostman,
			description: "API development and testing environment",
		},
		{
			name: "Prisma",
			icon: SiPrisma,
			description: "Next-generation ORM for Node.js and TypeScript",
		},
		{
			name: "Vite",
			icon: SiVite,
			description: "Modern frontend tooling for rapid development",
		},
	],
	Creative: [
		{
			name: "Figma",
			icon: FaFigma,
			description: "UI/UX design and prototype creation for web applications",
		},
		{
			name: "Unity",
			icon: DiUnitySmall,
			description: "Game development and interactive experiences",
		},
		{
			name: "After Effects",
			icon: SiAdobeaftereffects,
			description: "Motion graphics and visual effects creation",
		},
		{
			name: "Photoshop",
			icon: SiAdobephotoshop,
			description: "Digital image editing and graphic design",
		},
	],
};

const Skills = () => {
	const [activeCategory, setActiveCategory] =
		useState<keyof SkillCategories>("Frontend");
	const [flippedCard, setFlippedCard] = useState<string | null>(null);
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);

	const handleCardClick = (skillName: string) => {
		setFlippedCard(flippedCard === skillName ? null : skillName);
	};

	return (
		<section
			id="skills"
			className="py-4 sm:py-8 relative z-10 min-h-screen">
			<div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-xl sm:text-2xl font-space font-bold text-center text-white mb-4 sm:mb-6">
					My Skills
				</motion.h2>
				<div className="grid grid-cols-3 xs:grid-cols-3 sm:flex sm:justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
					{/* Category tabs */}
					{(Object.keys(skillsByCategory) as Array<keyof SkillCategories>).map(
						(category) => (
							<motion.button
								key={category}
								onClick={() => setActiveCategory(category)}
								className={cn(
									"px-2 py-3 rounded-full text-[10px] sm:text-sm font-medium whitespace-nowrap font-manrope",
									activeCategory === category
										? "bg-purple-500/20 text-white"
										: "text-purple-200 hover:text-white"
								)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}>
								{category}
							</motion.button>
						)
					)}
				</div>
				<AnimatePresence mode="wait">
					<motion.div
						key={activeCategory}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.5 }}
						className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
						{skillsByCategory[activeCategory].map((skill) => (
							<motion.div
								key={skill.name}
								className="relative h-[140px] xs:h-[140px] sm:h-[160px] w-full max-w-[280px] mx-auto perspective-1000 cursor-pointer"
								whileHover={{ scale: 1.02 }}
								onClick={() => handleCardClick(skill.name)}
								onMouseEnter={() => setHoveredCard(skill.name)}
								onMouseLeave={() => setHoveredCard(null)}>
								<div
									className={`skill-card ${
										flippedCard === skill.name || hoveredCard === skill.name
											? "is-flipped"
											: ""
									}`}>
									<div className="skill-card-front rounded-xl flex flex-col items-center justify-center">
										<skill.icon className="w-12 h-12 sm:w-12 sm:h-12 text-purple-400 mb-1 sm:mb-2" />
										<span className="text-xs sm:text-sm font-medium text-white">
											{skill.name}
										</span>
									</div>
									<div className="skill-card-back rounded-xl p-2 sm:p-3">
										<p className="text-xs sm:text-sm">{skill.description}</p>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				</AnimatePresence>
			</div>
		</section>
	);
};

export default Skills;
