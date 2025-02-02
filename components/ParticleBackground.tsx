import { useEffect, useRef } from "react";

const ParticleBackground = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx || !container) return;

		// Set initial canvas size to match container
		const updateCanvasSize = () => {
			const rect = container.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};
		updateCanvasSize();

		let particles: Particle[] = [];
		const particleCount = 30; // Reduced from 100 to 30

		class Particle {
			x: number;
			y: number;
			speed: number;
			size: number;
			opacity: number;
			fadeIn: boolean;

			constructor() {
				this.x = Math.random() * canvas!.width;
				this.y = Math.random() * canvas!.height;
				this.speed = Math.random() * 0.15 + 0.05;
				this.size = Math.random() * 1.5 + 0.5;
				this.opacity = 0;
				this.fadeIn = true;
			}

			update() {
				this.y -= this.speed;

				// Handle opacity transitions
				if (this.fadeIn) {
					this.opacity += 0.02;
					if (this.opacity >= 0.8) this.opacity = 0.8;
				}

				// Start fade out when near top
				if (this.y < canvas!.height * 0.1) {
					this.fadeIn = false;
					this.opacity -= 0.02;
				}

				// Reset particle when completely faded out
				if (this.opacity <= 0) {
					this.y = canvas!.height;
					this.opacity = 0;
					this.fadeIn = true;
				}
			}

			draw() {
				ctx!.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
				ctx!.beginPath();
				ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
				ctx!.fill();
			}
		}

		// Initialize particles
		for (let i = 0; i < particleCount; i++) {
			particles.push(new Particle());
		}

		function animate() {
			ctx!.clearRect(0, 0, canvas!.width, canvas!.height); // Changed from fillRect to clearRect

			particles.forEach((particle) => {
				particle.update();
				particle.draw();
			});

			requestAnimationFrame(animate);
		}

		animate();

		// Update resize handler to use container size
		const observer = new ResizeObserver(updateCanvasSize);
		observer.observe(container);

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={containerRef}
			className="absolute inset-0">
			<canvas
				ref={canvasRef}
				className="w-full h-full pointer-events-none"
			/>
		</div>
	);
};

export default ParticleBackground;
