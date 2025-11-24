"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ImageZoomModal({
	isOpen,
	images,
	currentIndex,
	title,
	onClose,
	onNext,
	onPrev,
	onGoToImage,
}) {
	const handleNavigation = (e, direction) => {
		e.stopPropagation();
		if (direction === "next") {
			onNext();
		} else {
			onPrev();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-black/95 p-4"
					onClick={onClose}
				>
					<button
						className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
						onClick={onClose}
						aria-label="Close zoom"
					>
						<X size={24} />
					</button>

					{/* Desktop Layout */}
					<motion.div
						className="hidden items-center gap-4 md:flex"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						{images.length > 1 && (
							<motion.button
								onClick={(e) => handleNavigation(e, "prev")}
								className="rounded-full bg-white/10 p-3 text-white transition-all hover:scale-110 hover:cursor-pointer hover:bg-white/20"
								aria-label="Previous image"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								<ChevronLeft size={32} />
							</motion.button>
						)}

						<div className="flex flex-col items-center gap-4">
							<motion.div
								className="relative h-[85vh]"
								onClick={(e) => e.stopPropagation()}
								initial={{ scale: 0.9 }}
								animate={{ scale: 1 }}
								exit={{ scale: 0.9 }}
								transition={{ type: "spring", damping: 25, stiffness: 200 }}
							>
								<Image
									src={images[currentIndex]}
									alt={`${title} image ${currentIndex + 1}`}
									width={1920}
									height={1080}
									className="h-full w-full rounded-3xl"
								/>
							</motion.div>

							{images.length > 1 && (
								<motion.div
									className="flex items-center justify-center gap-2"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									{images.map((_, index) => (
										<motion.button
											key={index}
											onClick={(e) => {
												e.stopPropagation();
												onGoToImage(index);
											}}
											className={`h-2.5 rounded-full transition-all ${
												index === currentIndex
													? "w-8 bg-white"
													: "w-2.5 bg-zinc-600 hover:bg-zinc-400"
											}`}
											aria-label={`Go to image ${index + 1}`}
											whileHover={{ scale: 1.2 }}
											whileTap={{ scale: 0.9 }}
										/>
									))}
								</motion.div>
							)}
						</div>

						{images.length > 1 && (
							<motion.button
								onClick={(e) => handleNavigation(e, "next")}
								className="rounded-full bg-white/10 p-3 text-white transition-all hover:scale-110 hover:cursor-pointer hover:bg-white/20"
								aria-label="Next image"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								<ChevronRight size={32} />
							</motion.button>
						)}
					</motion.div>

					{/* Mobile Layout */}
					<motion.div
						className="flex flex-col items-center gap-4 md:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
					>
						<motion.div
							className="relative w-[90vw]"
							onClick={(e) => e.stopPropagation()}
							initial={{ scale: 0.9 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.9 }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
						>
							<Image
								src={images[currentIndex]}
								alt={`${title} image ${currentIndex + 1}`}
								width={1920}
								height={1080}
								className="h-full w-full rounded-2xl"
							/>
						</motion.div>

						{images.length > 1 && (
							<motion.div
								className="flex items-center gap-4"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
							>
								<motion.button
									onClick={(e) => handleNavigation(e, "prev")}
									className="rounded-full bg-white/10 p-3 text-white transition-all hover:scale-110 hover:bg-white/20"
									aria-label="Previous image"
									whileTap={{ scale: 0.95 }}
								>
									<ChevronLeft size={28} />
								</motion.button>

								<div className="flex items-center justify-center gap-2">
									{images.map((_, index) => (
										<motion.button
											key={index}
											onClick={(e) => {
												e.stopPropagation();
												onGoToImage(index);
											}}
											className={`h-2.5 rounded-full transition-all ${
												index === currentIndex
													? "w-8 bg-white"
													: "w-2.5 bg-zinc-600 hover:bg-zinc-400"
											}`}
											aria-label={`Go to image ${index + 1}`}
											whileTap={{ scale: 0.9 }}
										/>
									))}
								</div>

								<motion.button
									onClick={(e) => handleNavigation(e, "next")}
									className="rounded-full bg-white/10 p-3 text-white transition-all hover:scale-110 hover:bg-white/20"
									aria-label="Next image"
									whileTap={{ scale: 0.95 }}
								>
									<ChevronRight size={28} />
								</motion.button>
							</motion.div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
