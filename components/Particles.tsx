"use client";

import { useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = () => {
	const [init, setInit] = useState(false);

	useEffect(() => {
		initParticlesEngine(async (engine) => {
			await loadSlim(engine);
		}).then(() => {
			setInit(true);
		});
	}, []);

	return (
		init && (
			<Particles
				id="tsparticles"
				options={{
					fpsLimit: 120,
					fullScreen: { enable: true, zIndex: 1 },
					particles: {
						twinkle: {
							lines: { enable: true, frequency: 0.05, opacity: 0.2 },
							particles: { enable: true, frequency: 0.05, opacity: 0.2 },
						},
						number: {
							value: 10,
							limit: { value: 25 },
							density: { enable: true, width: 800, height: 800 },
						},
						color: {
							value: ["#9333EA", "#A855F7", "#7C3AED"],
						},
						rotate: {
							value: 0,
							random: true,
							direction: "clockwise",
							animation: {
								enable: true,
								speed: 5,
								sync: false,
							},
						},
						shape: {
							type: "triangle",
							options: {
								triangle: {
									sides: 3,
								},
							},
						},
						opacity: {
							value: {
								min: 0.01,
								max: 0.3,
							},
							animation: {
								enable: true,
								speed: 0.01,
								startValue: "random",
								sync: false,
							},
						},
						size: {
							value: {
								min: 1,
								max: 19,
							},
							animation: {
								enable: true,
								speed: 0.01,
								startValue: "random",
								sync: false,
							},
						},
						move: {
							enable: true,
							speed: 1,
							direction: "none",
							random: true,
							straight: false,
							outModes: "out",
							attract: { enable: true, rotate: { x: 600, y: 1200 } },
						},
					},
					interactivity: {
						events: {
							onClick: {
								enable: true,
								mode: ["push", "connect"],
							},
							onHover: {
								enable: true,
								mode: ["bubble", "repulse", "parallax"],
							},
						},
						modes: {
							parallax: {
								enable: true,
								force: 60,
								smooth: 10,
							},
							bubble: {
								distance: 300,
								duration: 1.2,
								size: "random",
								opacity: 1,
								mix: false,
								divs: {
									enable: false,
								},
							},
							connect: {
								distance: 80,
								radius: 60,
								lineLinked: {
									opacity: 0.5,
								},
							},
							push: {
								quantity: 3,
							},
							repulse: {
								distance: 200,
								duration: 0.1,
								speed: 0.05,
							},
						},
					},
					lifecycle: {
						bubble: {
							duration: 1.2,
							delay: 0,
						},
					},
					detectRetina: true,
					background: {
						color: "transparent",
					},
				}}
			/>
		)
	);
};

export default ParticlesComponent;
