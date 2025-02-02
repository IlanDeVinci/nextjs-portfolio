import { motion } from "framer-motion";

const Separator = () => {
	return (
		<div className="relative h-24 overflow-hidden">
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 1 }}
				className="absolute inset-0 flex justify-center items-center">
				<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
				<div className="absolute w-24 h-24 bg-gradient-to-t from-transparent to-purple-500/5 blur-xl transform -translate-y-12" />
			</motion.div>
		</div>
	);
};

export default Separator;
