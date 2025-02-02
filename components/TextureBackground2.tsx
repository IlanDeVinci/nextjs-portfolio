"use client";

import { motion } from "framer-motion";

const TextureBackground2 = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 1 }}
			className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none"
			style={{ minHeight: "100vh" }}>
			<div className="h-full w-full relative">
				<motion.div
					animate={{
						y: [-40, 40, -40],
						rotate: [0, 5, -5, 0],
						opacity: [0.4, 0.7, 0.4],
					}}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-purple-600/40 rounded-full mix-blend-screen filter blur-[60px]"
				/>
				<motion.div
					animate={{
						y: [40, -40, 40],
						rotate: [0, -5, 5, 0],
						opacity: [0.3, 0.6, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute top-1/3 left-[5%] w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[50px]"
				/>
				<motion.div
					animate={{
						y: [-45, 45, -45],
						rotate: [0, 8, -8, 0],
						opacity: [0.4, 0.8, 0.4],
					}}
					transition={{
						duration: 7,
						repeat: Infinity,
						ease: "easeInOut",
					}}
					className="absolute bottom-1/4 left-[15%] w-96 h-96 bg-violet-600/40 rounded-full mix-blend-screen filter blur-[50px]"
				/>
			</div>
		</motion.div>
	);
};

export default TextureBackground2;
