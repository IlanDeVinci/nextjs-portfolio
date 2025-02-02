"use client";

import { useEffect, useRef, useState } from "react";

interface TrailDot {
	x: number;
	y: number;
	id: number;
}

export default function CursorTrail() {
	const [dots, setDots] = useState<TrailDot[]>([]);
	const nextIdRef = useRef(0);
	const lastUpdateRef = useRef(0);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const now = performance.now();
			if (now - lastUpdateRef.current < 5) return; // Limit to ~100 dots per second

			lastUpdateRef.current = now;
			const newDot: TrailDot = {
				x: e.clientX,
				y: e.clientY,
				id: nextIdRef.current++,
			};

			setDots((prev) => [...prev, newDot]);

			setTimeout(() => {
				setDots((prev) => prev.filter((dot) => dot.id !== newDot.id));
			}, 500);
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<>
			{dots.map((dot) => (
				<div
					key={dot.id}
					className="pointer-events-none fixed h-4 w-4 rounded-full bg-purple-600/40"
					style={{
						left: `${dot.x}px`,
						top: `${dot.y}px`,
						transform: "translate(-50%, -50%)",
						animation: "trail 500ms forwards",
						zIndex: 1000 - dot.id,
						boxShadow: "0 0 10px 2px rgba(168, 85, 247, 0.4)",
					}}
				/>
			))}
			<style jsx>{`
				@keyframes trail {
					0% {
						opacity: 0.5;
						transform: translate(-50%, -50%) scale(1);
					}
					100% {
						opacity: 0;
						transform: translate(-50%, -50%) scale(0.2);
					}
				}
			`}</style>
		</>
	);
}
