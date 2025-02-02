"use client";

import { motion } from "framer-motion";
import Globe from "./Globe";
import Separator from "./Separator";
import { useState } from "react";

const studies = [
	{
		degree: "Bachelor of Coding and Digital Innovation",
		university: "Institute of Internet & Multimedia",
		year: "2023-2026",
		description: "Advanced web technologies and modern development practices",
		status: "Current",
		location: { city: "Paris", coordinates: [48.8566, 2.3522] },
	},
	{
		degree: "Scientific Baccalaureate with Highest Honors",
		university: "Lycée Français Vauban du Luxembourg",
		year: "2018-2022",
		description: "Specialization in Mathematics and Physics-Chemistry",
		status: "Completed",
		location: { city: "Luxembourg", coordinates: [49.6116, 6.1319] },
	},
	{
		degree: "Middle School Education",
		university: "New York City Middle School",
		year: "2014-2018",
		description: "Foundation in STEM subjects with honors",
		status: "Completed",
		location: { city: "New York", coordinates: [40.7128, -74.006] },
	},
];

const Studies = () => {
	// Add state to track active study
	const [activeStudy, setActiveStudy] = useState<string | null>(null);

	const handleStudyClick = (study: (typeof studies)[0]) => {
		if (activeStudy === study.location.city) {
			// If clicking the active study, clear it
			setActiveStudy(null);
			window.dispatchEvent(new CustomEvent("clearLocation"));
		} else {
			// Set new active study and focus location
			setActiveStudy(study.location.city);
			window.dispatchEvent(
				new CustomEvent("focusLocation", {
					detail: study.location,
				})
			);
		}
	};

	return (
		<>
			<section
				id="studies"
				className="py-16 relative z-10">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="text-3xl font-bold text-center text-white mb-12">
						Academic Journey
					</motion.h2>

					<div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
						{/* Studies Timeline - Left Side */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="w-full lg:w-1/2 max-w-[85%] sm:max-w-xl mx-auto lg:max-w-none">
							<div className="relative pl-6 sm:pl-8 border-l-2 border-purple-600/30">
								{studies.map((study, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, x: -20 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.5, delay: index * 0.2 }}
										className={`relative mb-8 sm:mb-12 cursor-pointer ${
											activeStudy === study.location.city ? "scale-105" : ""
										}`}
										onClick={() => handleStudyClick(study)}>
										{/* Timeline dot */}
										<div className="absolute -left-[33px] sm:-left-[41px] w-4 sm:w-5 h-4 sm:h-5 bg-purple-600 rounded-full border-4 border-purple-900" />

										<div className="relative group">
											<div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-900 rounded-lg blur-md opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
											<div className="relative bg-purple-900/40 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500">
												<span className="inline-block px-3 py-1 text-sm font-medium text-purple-200 bg-purple-500/20 rounded-full mb-3">
													{study.year}
												</span>
												<h3 className="text-xl font-bold text-white mb-2">
													{study.degree}
												</h3>
												<p className="text-purple-200 mb-2">
													{study.university}
												</p>
												<p className="text-purple-300/80 text-sm">
													{study.description}
												</p>
												<span
													className={`inline-block px-2 py-1 text-xs font-medium rounded mt-2 ${
														study.status === "Current"
															? "bg-purple-500/30 text-purple-200"
															: "bg-green-500/30 text-green-200"
													}`}>
													{study.status}
												</span>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>

						{/* Globe - Right Side */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="w-full lg:w-1/2 lg:sticky lg:top-32 h-[400px] sm:h-[500px]">
							<Globe />
						</motion.div>
					</div>
				</div>
			</section>
			<Separator />
		</>
	);
};

export default Studies;
