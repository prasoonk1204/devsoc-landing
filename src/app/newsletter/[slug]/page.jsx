"use client";

import { use, useState, useEffect } from "react";
import { newsletterItems } from "@/constant/newsletter";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function Page({ params }) {
	const { slug } = use(params);
	const newsletter = newsletterItems.find((item) => item.slug === slug);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);

	if (!newsletter) {
		notFound();
	}

	// Lock body scroll when zoomed
	useEffect(() => {
		if (isZoomed) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isZoomed]);

	const nextImage = () => {
		setCurrentImageIndex((prev) =>
			prev === newsletter.images.length - 1 ? 0 : prev + 1,
		);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) =>
			prev === 0 ? newsletter.images.length - 1 : prev - 1,
		);
	};

	const goToImage = (index) => {
		setCurrentImageIndex(index);
	};

	const toggleZoom = () => {
		setIsZoomed(!isZoomed);
	};

	const handleZoomNavigation = (e, direction) => {
		e.stopPropagation();
		if (direction === "next") {
			nextImage();
		} else {
			prevImage();
		}
	};

	return (
		<div className="flex w-full flex-col items-center justify-center gap-8 bg-black p-4 pt-20 pb-16 text-white sm:pb-24 md:pt-40">
			<div className="relative w-full max-w-6xl">
				<motion.div
					className="absolute -top-10 left-0 sm:-top-14"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link
						href="/newsletter"
						className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white"
					>
						<ArrowLeft size={18} />
						Back to all events
					</Link>
				</motion.div>

				{/* Header */}
				<motion.div
					className="mt-4 mb-8 flex flex-col gap-2 border-b border-neutral-700 pb-4 font-sans"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<h1 className="text-4xl text-white">{newsletter.title}</h1>
					<div className="flex flex-col justify-between text-neutral-300 sm:flex-row sm:text-lg">
						<p>By {newsletter.author}</p>
						<p>{newsletter.date}</p>
					</div>
				</motion.div>

				{/* Desktop Carousel */}
				<motion.div
					className="relative mx-auto hidden md:flex md:items-center md:justify-center md:gap-4"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.3 }}
				>
					{/* Left Arrow */}
					{newsletter.images.length > 1 && (
						<motion.button
							onClick={prevImage}
							className="z-10 rounded-full bg-neutral-800 p-2 text-white transition-all hover:scale-110 hover:cursor-pointer hover:bg-neutral-700"
							aria-label="Previous image"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
						>
							<ChevronLeft size={24} />
						</motion.button>
					)}

					{/* Image and Indicators Container */}
					<div className="flex flex-col items-center gap-4">
						<div
							className="group relative h-[600px] cursor-zoom-in overflow-hidden rounded-3xl bg-neutral-900"
							onClick={toggleZoom}
						>
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={currentImageIndex}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									className="relative h-full w-full"
								>
									<Image
										src={newsletter.images[currentImageIndex]}
										alt={`${newsletter.title} image ${currentImageIndex + 1}`}
										width={1200}
										height={1600}
										className="h-full w-full"
										priority={currentImageIndex === 0}
									/>
								</motion.div>
							</AnimatePresence>

							{/* Zoom Icon Indicator */}
							<motion.div
								className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white"
								initial={{ opacity: 0 }}
								whileHover={{ opacity: 1 }}
								transition={{ duration: 0.2 }}
							>
								<ZoomIn size={20} />
							</motion.div>
						</div>

						{newsletter.images.length > 1 && (
							<motion.div
								className="flex items-center justify-center gap-2"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 }}
							>
								{newsletter.images.map((_, index) => (
									<motion.button
										key={index}
										onClick={() => goToImage(index)}
										className={`h-2.5 rounded-full transition-all ${
											index === currentImageIndex
												? "w-8 bg-white"
												: "w-2.5 bg-neutral-600 hover:bg-neutral-400"
										}`}
										aria-label={`Go to image ${index + 1}`}
										whileHover={{ scale: 1.2 }}
										whileTap={{ scale: 0.9 }}
									/>
								))}
							</motion.div>
						)}
					</div>

					{/* Right Arrow */}
					{newsletter.images.length > 1 && (
						<motion.button
							onClick={nextImage}
							className="z-10 rounded-full bg-neutral-800 p-2 text-white transition-all hover:scale-110 hover:cursor-pointer hover:bg-neutral-700"
							aria-label="Next image"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
						>
							<ChevronRight size={24} />
						</motion.button>
					)}
				</motion.div>

				{/* Mobile Carousel */}
				<motion.div
					className="relative w-full md:hidden"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.3 }}
				>
					<div className="relative -mx-4 overflow-x-scroll overscroll-x-auto scroll-smooth py-4 [scrollbar-width:none]">
						<div className="flex gap-4 px-4">
							{newsletter.images.map((image, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{
										duration: 0.5,
										delay: 0.1 * index,
										ease: "easeOut",
									}}
									className="relative w-72 shrink-0 overflow-hidden rounded-3xl bg-neutral-900 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
									onClick={() => {
										setCurrentImageIndex(index);
										toggleZoom();
									}}
									whileTap={{ scale: 0.95 }}
								>
									<Image
										src={image}
										alt={`${newsletter.title} image ${index + 1}`}
										width={600}
										height={800}
										className="h-full w-full object-cover"
									/>
									<div className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white">
										<ZoomIn size={16} />
									</div>
								</motion.div>
							))}
						</div>
					</div>
					<motion.div
						className="mt-4 flex items-center justify-center gap-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
					>
						{newsletter.images.map((_, index) => (
							<div
								key={index}
								className="h-1.5 w-1.5 rounded-full bg-neutral-600"
							/>
						))}
					</motion.div>
				</motion.div>

				{/* Zoomed Image Modal */}
				<AnimatePresence>
					{isZoomed && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-black/95 p-4"
							onClick={toggleZoom}
						>
							{/* Close Button */}
							<button
								className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
								onClick={toggleZoom}
								aria-label="Close zoom"
							>
								<X size={24} />
							</button>

							{/* Desktop Zoom Layout */}
							<motion.div
								className="hidden items-center gap-4 md:flex"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
							>
								{newsletter.images.length > 1 && (
									<motion.button
										onClick={(e) => handleZoomNavigation(e, "prev")}
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
											src={newsletter.images[currentImageIndex]}
											alt={`${newsletter.title} image ${currentImageIndex + 1}`}
											width={1920}
											height={1080}
											className="h-full w-full rounded-3xl"
										/>
									</motion.div>

									{newsletter.images.length > 1 && (
										<motion.div
											className="flex items-center justify-center gap-2"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2 }}
										>
											{newsletter.images.map((_, index) => (
												<motion.button
													key={index}
													onClick={(e) => {
														e.stopPropagation();
														goToImage(index);
													}}
													className={`h-2.5 rounded-full transition-all ${
														index === currentImageIndex
															? "w-8 bg-white"
															: "w-2.5 bg-neutral-600 hover:bg-neutral-400"
													}`}
													aria-label={`Go to image ${index + 1}`}
													whileHover={{ scale: 1.2 }}
													whileTap={{ scale: 0.9 }}
												/>
											))}
										</motion.div>
									)}
								</div>

								{newsletter.images.length > 1 && (
									<motion.button
										onClick={(e) => handleZoomNavigation(e, "next")}
										className="rounded-full bg-white/10 p-3 text-white transition-all hover:scale-110 hover:cursor-pointer hover:bg-white/20"
										aria-label="Next image"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
									>
										<ChevronRight size={32} />
									</motion.button>
								)}
							</motion.div>

							{/* Mobile Zoom Layout */}
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
										src={newsletter.images[currentImageIndex]}
										alt={`${newsletter.title} image ${currentImageIndex + 1}`}
										width={1920}
										height={1080}
										className="h-full w-full rounded-2xl"
									/>
								</motion.div>

								{newsletter.images.length > 1 && (
									<motion.div
										className="flex items-center gap-4"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 }}
									>
										<motion.button
											onClick={(e) => handleZoomNavigation(e, "prev")}
											className="rounded-full bg-white/10 p-3 text-white transition-all hover:scale-110 hover:bg-white/20"
											aria-label="Previous image"
											whileTap={{ scale: 0.95 }}
										>
											<ChevronLeft size={28} />
										</motion.button>

										<div className="flex items-center justify-center gap-2">
											{newsletter.images.map((_, index) => (
												<motion.button
													key={index}
													onClick={(e) => {
														e.stopPropagation();
														goToImage(index);
													}}
													className={`h-2.5 rounded-full transition-all ${
														index === currentImageIndex
															? "w-8 bg-white"
															: "w-2.5 bg-neutral-600 hover:bg-neutral-400"
													}`}
													aria-label={`Go to image ${index + 1}`}
													whileTap={{ scale: 0.9 }}
												/>
											))}
										</div>

										<motion.button
											onClick={(e) => handleZoomNavigation(e, "next")}
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
			</div>
		</div>
	);
}
