"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import {
	Navigation,
	Pagination,
	Mousewheel,
	EffectCoverflow,
} from "swiper/modules";
import type { SwiperSlideProps, SwiperProps } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/free-mode";
import "swiper/css/effect-coverflow";
import { useState, useEffect } from "react";

declare global {
	interface IntrinsicElements {
		Swiper: React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLElement> & SwiperProps,
			HTMLElement
		>;
		SwiperSlide: React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLElement> & SwiperSlideProps,
			HTMLElement
		>;
	}
}
const projects = [
	{
		title: "ToDoList",
		description: "A modern task management application built with JavaScript",
		images: ["/projects/todolist-1.jpg"], // Add multiple images per project
		github: "https://github.com/IlanDeVinci/ToDoList",
		technologies: ["TypeScript", "HTML", "CSS", "JavaScript", "PostgreSQL"],
	},
	{
		title: "Accessibility Website",
		description:
			"A fully accessible website showcasing web accessibility best practices",
		images: [
			"/projects/accessibility-1.jpg",
			"/projects/accessibility-2.jpg",
			"/projects/accessibility-3.jpg",
		],
		github: "https://github.com/IlanDeVinci/AccessibilityWebsite",
		technologies: ["JavaScript", "ARIA", "WCAG", "Bootsrap"],
	},
	{
		title: "Symfony E-commerce",
		description:
			"A full-featured e-commerce platform built with Symfony framework",
		images: [
			"/projects/ecommerce-1.jpg",
			"/projects/ecommerce-2.jpg",
			"/projects/ecommerce-3.jpg",
		],
		github: "https://github.com/IlanDeVinci/SymfonyEcommerce",
		technologies: ["PHP", "Symfony", "MySQL", "Doctrine", "Twig"],
	},
	{
		title: "Pokemon Project",
		description: "Interactive Pokemon application built with PHP",
		images: [
			"/projects/pokemon-project-1.jpg",
			"/projects/pokemon-project-2.jpg",
			"/projects/pokemon-project-3.jpg",
		],
		github: "https://github.com/IlanDeVinci/PokemonProject",
		technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript", "AJAX"],
	},
	{
		title: "Harry Potter Trading Card Platform",
		description: "Harry Potter themed trading cart system using Node.js",
		images: [
			"/projects/harrypotter-1.jpg",
			"/projects/harrypotter-2.jpg",
			"/projects/harrypotter-3.jpg",
			"/projects/harrypotter-4.jpg",
		],
		github: "https://github.com/IlanDeVinci/HarryPotterNode.js",
		technologies: ["Node.js", "Express", "JavaScript"],
	},
	{
		title: "Pokedex",
		description: "Comprehensive Pokedex application",
		images: [
			"/projects/pokedex-1.jpg",
			"/projects/pokedex-2.jpg",
			"/projects/pokedex-3.jpg",
			"/projects/pokedex-4.jpg",
			"/projects/pokedex-5.jpg",
			"/projects/pokedex-6.jpg",
			"/projects/pokedex-7.jpg",
		],
		github: "https://github.com/IlanDeVinci/Pokedex",
		technologies: ["JavaScript", "PokeAPI", "HTML", "CSS"],
	},
	{
		title: "Integration Preprocesseur",
		description: "Web integration project using preprocessors",
		images: ["/projects/sass-1.jpg", "/projects/sass-2.jpg"],
		github: "https://github.com/IlanDeVinci/integrationpreprocesseur",
		technologies: ["HTML", "SASS", "CSS"],
	},
	{
		title: "Project Mask Game",
		description: "Gaming project developed in C#",
		images: [
			"/projects/projectmask-1.jpg",
			"/projects/projectmask-2.jpg",
			"/projects/projectmask-3.jpg",
			"/projects/projectmask-4.jpg",
			"/projects/projectmask-5.jpg",
		],
		github: "https://github.com/IlanDeVinci/ProjectMas",
		technologies: ["C#", "Unity", "Game Development"],
	},
	{
		title: "Projet Transversal Siren",
		description: "Collaborative game development project",
		images: [
			"/projects/siren-1.jpg",
			"/projects/siren-2.jpg",
			"/projects/siren-3.jpg",
			"/projects/siren-4.jpg",
		],
		github: "https://github.com/IlanDeVinci/Projet-Transversal",
		technologies: ["C#", "Unity", "Game Design", "Game Development"],
	},
	{
		title: "Portfolio",
		description: "Personal portfolio website built with Next.js",
		images: [
			"/projects/portfolio-1.jpg",
			"/projects/portfolio-2.jpg",
			"/projects/portfolio-3.jpg",
		],
		github: "https://github.com/IlanDeVinci/Portfolio",
		website: "https://portfolio.ilandevinci.com",
		technologies: [
			"Next.js",
			"TypeScript",
			"TailwindCSS",
			"Three.js",
			"Framer Motion",
		],
	},
	{
		title: "Restaurant Website",
		description: "Restaurant website built with Next.JS",
		images: [
			"/projects/restaurant-1.jpg",
			"/projects/restaurant-2.jpg",
			"/projects/restaurant-3.jpg",
			"/projects/restaurant-4.jpg",
		],
		github: "https://github.com/IlanDeVinci/cozy_restaurant",
		website: "https://cozy-restaurant.vercel.app/",
		technologies: ["Next.JS", "TailwindCSS", "TypeScript"],
	},
];

type ProjectProps = {
	project: {
		title: string;
		description: string;
		images: string[]; // Update type to array of strings
		github: string;
		website?: string;
		technologies: string[];
	};
	isActive?: boolean; // Add isActive prop
};

const ProjectCard = ({ project, isActive }: ProjectProps) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [lastInteractionTime, setLastInteractionTime] = useState(0);

	// Reset image index when slide becomes inactive
	useEffect(() => {
		if (!isActive) {
			setCurrentImageIndex(0);
			setLastInteractionTime(0);
		}
	}, [isActive]);

	// Auto-advance images when slide is active
	useEffect(() => {
		if (!isActive || project.images.length <= 1) return;

		const interval = setInterval(() => {
			const timeSinceLastInteraction = Date.now() - lastInteractionTime;
			if (timeSinceLastInteraction >= 3000) {
				setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [isActive, project.images.length, lastInteractionTime]);

	const handleImageClick = () => {
		if (!isActive || project.images.length <= 1) return;
		setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
		setLastInteractionTime(Date.now());
	};

	return (
		<motion.div
			whileHover={{ y: -5 }}
			className="bg-purple-900/20 backdrop-blur-md rounded-xl overflow-hidden group border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 h-[500px] sm:h-[600px] flex flex-col">
			<div
				className="relative w-full aspect-video overflow-hidden cursor-pointer"
				onClick={handleImageClick}>
				{/* Image pagination dots */}
				<div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
					{project.images.map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentImageIndex(index)}
							className={`w-2 h-2 rounded-full transition-all duration-300 ${
								currentImageIndex === index
									? "bg-purple-500 scale-125"
									: "bg-purple-500/40 hover:bg-purple-500/60"
							}`}
							aria-label={`Go to image ${index + 1}`}
						/>
					))}
				</div>

				<div className="absolute inset-0 bg-violet-950/10 group-hover:bg-purple-900/0 transition-colors duration-500 z-10" />
				<div className="absolute inset-0 bg-purple-900/10">
					<AnimatePresence
						initial={false}
						mode="popLayout">
						<motion.div
							key={currentImageIndex}
							initial={{
								y: "100%",
								scale: 1.2,
								opacity: 0,
								rotateX: "30deg",
							}}
							animate={{
								y: 0,
								scale: 1,
								opacity: 1,
								rotateX: "0deg",
							}}
							exit={{
								y: "-100%",
								scale: 1.2,
								opacity: 0,
								rotateX: "-30deg",
							}}
							transition={{
								duration: 0.6,
								ease: [0.32, 0.72, 0, 1], // Custom easing for a smooth effect
								opacity: { duration: 0.3 },
							}}
							className="absolute inset-0 [outline:1px_solid_rgba(147,51,234,0.1)] origin-center"
							style={{
								backfaceVisibility: "hidden",
								transformStyle: "preserve-3d",
								perspective: "1000px",
								willChange: "transform, opacity",
								imageRendering: "auto",
							}}>
							<Image
								src={project.images[currentImageIndex]}
								alt={`${project.title} - Image ${currentImageIndex + 1}`}
								fill
								className="object-cover transform-gpu select-none"
								priority={isActive}
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								quality={95}
								placeholder="blur"
								blurDataURL={`data:image/svg+xml;base64,${btoa(
									'<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#4B157D"/></svg>'
								)}`}
								loading={isActive ? "eager" : "lazy"}
								unoptimized={false}
								style={{
									imageRendering: "-webkit-optimize-contrast",
								}}
							/>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
			<div className="p-4 sm:p-8 flex flex-col flex-1">
				<h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
					{project.title}
				</h3>
				<p className="text-purple-200 mb-4 sm:mb-6 text-base sm:text-lg flex-grow">
					{project.description}
				</p>
				<div className="flex flex-wrap gap-2 mb-6">
					{project.technologies.map((tech) => (
						<span
							key={tech}
							className="text-sm bg-purple-800/50 px-3 py-1 rounded-full text-purple-200 font-medium">
							{tech}
						</span>
					))}
				</div>
				<div className="flex gap-4 mt-auto">
					<Button
						asChild
						variant="ghost"
						className="flex items-center gap-2">
						<a
							href={project.github}
							target="_blank"
							rel="noopener noreferrer">
							<FaGithub className="w-4 h-4" />
							GitHub
						</a>
					</Button>
					{project.website && (
						<Button
							asChild
							className="flex items-center gap-2">
							<a
								href={project.website}
								target="_blank"
								rel="noopener noreferrer">
								<FiExternalLink className="w-4 h-4" />
								Visit Site
							</a>
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	);
};

const Projects = () => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [swiperInstance, setSwiperInstance] = useState<any>(null);

	// Add initialization effect
	useEffect(() => {
		if (swiperInstance) {
			// Perform 3 automatic slides with delays
			const initializeSlider = async () => {
				await new Promise((resolve) => setTimeout(resolve, 500));
				swiperInstance.slideNext();
				await new Promise((resolve) => setTimeout(resolve, 300));
				swiperInstance.slidePrev();
				await new Promise((resolve) => setTimeout(resolve, 300));
				swiperInstance.slideNext();
			};

			initializeSlider();
		}
	}, [swiperInstance]);

	return (
		<section
			id="projects"
			className="pt-8 pb-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-3xl font-bold text-center text-white mb-12">
					My Projects
				</motion.h2>
				<div className="mt-12 relative overflow-hidden">
					<style
						jsx
						global>
						{`
							.swiper {
								overflow: hidden !important;
								position: relative;
								padding: 2rem 0 !important;
							}
							.swiper-wrapper {
								transition-timing-function: ease-out !important;
								align-items: center;
								pointer-events: none !important;
							}
							.swiper-slide {
								transition: all 0.6s ease-out;
								opacity: 0.3;
								transform: scale(0.8);
								pointer-events: none;
							}
							.swiper-slide-active {
								opacity: 1;
								transform: scale(1);
								pointer-events: auto;
							}
							.swiper-slide-prev,
							.swiper-slide-next {
								opacity: 0.6;
								transform: scale(0.9);
								pointer-events: auto;
							}
							.swiper-button-prev,
							.swiper-button-next {
								color: rgb(147, 51, 234) !important;
								transform: translateY(-50%) !important;
								transition: all 0.3s ease;
								background: rgba(88, 28, 135, 0.3);
								border-radius: 50%;
								width: 50px !important; /* Increased from 40px */
								height: 50px !important; /* Increased from 40px */
								backdrop-filter: blur(4px);
							}
							.swiper-button-prev {
								left: 100px;
							}
							.swiper-button-next {
								right: 100px;
							}
							.swiper-button-prev:hover,
							.swiper-button-next:hover {
								background: rgba(147, 51, 234, 0.4);
							}
							.swiper-button-prev:after,
							.swiper-button-next:after {
								font-size: 1.5rem !important;
							}
							.swiper-pagination-bullet {
								background: rgba(147, 51, 234, 0.5) !important;
								opacity: 0.5;
								transition: all 0.3s ease;
							}
							.swiper-pagination-bullet-active {
								background: rgb(147, 51, 234) !important;
								opacity: 1;
								width: 20px;
								border-radius: 4px;
							}
						`}
					</style>
					{/* Add mask overlay */}
					<div className="absolute inset-0 z-10 pointer-events-none [animation:none]">
						<div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-background to-transparent [animation:none]" />
						<div className="absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-background to-transparent [animation:none]" />
					</div>
					<Swiper
						onSwiper={setSwiperInstance}
						modules={[Navigation, Pagination, Mousewheel, EffectCoverflow]}
						spaceBetween={30}
						slidesPerView={1.001}
						centeredSlides={true}
						initialSlide={3}
						mousewheel={{
							sensitivity: 1,
							enabled: true,
							forceToAxis: true,
						}}
						navigation={{
							enabled: true,
							hideOnClick: false,
						}}
						pagination={{
							clickable: true,
							type: "bullets",
						}}
						loop={true}
						watchSlidesProgress={true}
						preventInteractionOnTransition={true}
						speed={600}
						resistanceRatio={0.65}
						effect="coverflow"
						coverflowEffect={{
							rotate: 0,
							stretch: 0,
							depth: 100,
							modifier: 1.5,
							slideShadows: false,
						}}
						breakpoints={{
							375: {
								slidesPerView: 1.1,
								spaceBetween: 15,
							},
							640: {
								slidesPerView: 1.3,
								spaceBetween: 20,
							},
							1024: {
								slidesPerView: 2.4,
								spaceBetween: 30,
							},
						}}
						onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
						className="!pb-16 !pt-4">
						{projects.map((project, index) => (
							<SwiperSlide
								key={index}
								className="h-full pointer-events-auto">
								<div className="h-full">
									<ProjectCard
										project={project}
										isActive={activeIndex === index}
									/>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</section>
	);
};

export default Projects;
