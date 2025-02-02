"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const ContactForm = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">(
		"idle"
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name"),
			email: formData.get("email"),
			message: formData.get("message"),
		};

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (response.ok) {
				setFormStatus("success");
				(e.target as HTMLFormElement).reset();
			} else {
				setFormStatus("error");
			}
		} catch (error) {
			setFormStatus("error");
			console.error("Failed to send message:", error);
		} finally {
			setIsLoading(false);
			setTimeout(() => setFormStatus("idle"), 3000);
		}
	};

	return (
		<section
			id="contact"
			className="py-20 relative overflow-hidden">
			{/* Brighter, matching gradient background */}
			<div className="absolute inset-0 bg-gradient-to-b from-[#0f0628]/90 via-[#0f0628]/80 to-[#0f0628]/70 pointer-events-none" />
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-[#0f0628]/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.1)]">
					<h2 className="text-3xl font-bold text-center text-white mb-2">
						Get in Touch
					</h2>
					<p className="text-purple-200 text-center mb-8 font-medium">
						Have a question or want to work together?
					</p>
					<form
						onSubmit={handleSubmit}
						className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-semibold text-purple-200 mb-2">
									Name
								</label>
								<Input
									id="name"
									name="name"
									required
									className="bg-[#0f0628]/70 border-2 border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500/70 text-white placeholder:text-purple-300/50 font-medium transition-colors duration-200"
									placeholder="John Doe"
								/>
							</div>
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-purple-200 mb-2">
									Email
								</label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									className="bg-[#0f0628]/70 border-2 border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500/70 text-white placeholder:text-purple-300/50 font-medium transition-colors duration-200"
									placeholder="john@example.com"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="message"
								className="block text-sm font-semibold text-purple-200 mb-2">
								Message
							</label>
							<Textarea
								id="message"
								name="message"
								required
								rows={6}
								className="bg-[#0f0628]/70 border-2 border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500/70 text-white placeholder:text-purple-300/50 font-medium transition-colors duration-200"
								placeholder="Your message here..."
							/>
						</div>
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-purple-600/80 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]">
							{isLoading ? (
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
							) : (
								<>
									<FaPaperPlane className="h-4 w-4" />
									Send Message
								</>
							)}
						</Button>
						{formStatus === "success" && (
							<p className="text-emerald-400 text-center font-medium">
								Message sent successfully!
							</p>
						)}
						{formStatus === "error" && (
							<p className="text-rose-400 text-center font-medium">
								Something went wrong. Please try again.
							</p>
						)}
					</form>
				</motion.div>
			</div>
		</section>
	);
};

export default ContactForm;
