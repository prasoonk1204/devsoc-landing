"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star } from "lucide-react";

export default function FeedbackModal({ isOpen, onClose, eventName }) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		feedback: "",
		stars: 0,
	});
	const [hoveredStar, setHoveredStar] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus(null);

		try {
			// Call our internal API route (server-side)
			const response = await fetch("/api/feedback", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					feedback: formData.feedback,
					name: formData.name,
					email: formData.email,
					stars: formData.stars,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit feedback");
			}

			setSubmitStatus("success");
			setTimeout(() => {
				onClose();
				setFormData({ name: "", email: "", feedback: "", stars: 0 });
				setSubmitStatus(null);
			}, 2000);
		} catch (error) {
			console.error("Error submitting feedback:", error);
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStarClick = (rating) => {
		setFormData({ ...formData, stars: rating });
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.2 }}
							className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl sm:max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								onClick={onClose}
								className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-400 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-zinc-800 hover:text-white sm:top-4 sm:right-4 sm:h-8 sm:w-8"
							>
								<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							</button>

							{/* Header */}
							<div className="flex flex-col items-center border-b border-white/10 bg-zinc-900/50 px-4 pt-6 pb-4 sm:px-6 sm:pt-7 sm:pb-5">
								<div className="from-accent to-accent/70 mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br sm:mb-3.5 sm:h-14 sm:w-14">
									<span className="font-iceland text-xl font-bold text-black sm:text-2xl">
										DS
									</span>
								</div>
								<h2 className="font-iceland text-center text-xl leading-tight font-bold text-white sm:text-2xl">
									{eventName}
								</h2>
								<p className="mt-1.5 text-xs text-zinc-400 sm:mt-2 sm:text-sm">
									Please share your feedbacks
								</p>
							</div>

							{/* Form */}
							<form onSubmit={handleSubmit} className="p-4 sm:p-5">
								{/* Name Input */}
								<div className="mb-3">
									<label
										htmlFor="name"
										className="mb-1.5 block text-xs font-medium text-white sm:text-sm"
									>
										Name
									</label>
									<input
										type="text"
										id="name"
										required
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										placeholder="Enter your name"
										className="focus:border-accent focus:ring-accent/20 w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:ring-2 focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
									/>
								</div>

								{/* Email Input */}
								<div className="mb-3">
									<label
										htmlFor="email"
										className="mb-1.5 block text-xs font-medium text-white sm:text-sm"
									>
										Email
									</label>
									<input
										type="email"
										id="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										placeholder="Enter your email (optional)"
										className="focus:border-accent focus:ring-accent/20 w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:ring-2 focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
									/>
								</div>

								{/* Feedback Textarea */}
								<div className="mb-3">
									<label
										htmlFor="feedback"
										className="mb-1.5 block text-xs font-medium text-white sm:text-sm"
									>
										Feedback
									</label>
									<textarea
										id="feedback"
										required
										value={formData.feedback}
										onChange={(e) =>
											setFormData({ ...formData, feedback: e.target.value })
										}
										placeholder="Please enter your feedback here"
										rows={3}
										className="focus:border-accent focus:ring-accent/20 w-full resize-none rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:ring-2 focus:outline-none sm:rounded-xl sm:px-4 sm:py-2.5"
									/>
								</div>

								{/* Star Rating */}
								<div className="mb-4">
									<label className="mb-1.5 block text-xs font-medium text-white sm:text-sm">
										Rating
									</label>
									<div className="flex gap-1.5 sm:gap-2">
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												type="button"
												onClick={() => handleStarClick(star)}
												onMouseEnter={() => setHoveredStar(star)}
												onMouseLeave={() => setHoveredStar(0)}
												className="transition-transform duration-200 hover:scale-110 active:scale-95"
											>
												<Star
													className={`h-7 w-7 transition-colors duration-200 sm:h-8 sm:w-8 ${
														star <= (hoveredStar || formData.stars)
															? "fill-accent text-accent"
															: "fill-zinc-700 text-zinc-700"
													}`}
												/>
											</button>
										))}
									</div>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={isSubmitting || !formData.stars}
									className="bg-accent hover:bg-accent/90 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,190,122,0.3)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3 sm:text-base"
								>
									{isSubmitting ? "Submitting..." : "Submit Feedback"}
								</button>

								{/* Status Messages */}
								{submitStatus === "success" && (
									<motion.p
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-3 text-center text-xs font-medium text-green-400 sm:text-sm"
									>
										Thank you for your feedback!
									</motion.p>
								)}
								{submitStatus === "error" && (
									<motion.p
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-3 text-center text-xs font-medium text-red-400 sm:text-sm"
									>
										Failed to submit feedback. Please try again.
									</motion.p>
								)}
							</form>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
