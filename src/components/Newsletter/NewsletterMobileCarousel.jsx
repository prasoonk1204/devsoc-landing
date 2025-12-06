"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { fadeInBlur } from "@/lib/motionVariants";

export default function NewsletterMobileCarousel({
	images,
	title,
	onImageClick,
	visibleImageIndex,
}) {
	return (
		<motion.div
			className="relative w-full md:hidden"
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<div className="mobile-scroll-container relative overflow-x-scroll overscroll-x-auto scroll-smooth py-4 [scrollbar-width:none]">
				<div className="flex gap-4">
					{images.map((image, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.5,
								delay: 0.1 * index,
								ease: "easeOut",
							}}
							className="relative w-72 shrink-0 overflow-hidden rounded-3xl bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
							onClick={() => onImageClick(index)}
							whileTap={{ scale: 0.95 }}
						>
							<Image
								src={image}
								alt={`${title} image ${index + 1}`}
								width={600}
								height={800}
								quality={85}
								priority={index < 2}
								placeholder="blur"
								blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzI3MjcyNyIvPjwvc3ZnPg=="
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
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.6 }}
			>
				{images.map((_, index) => (
					<motion.div
						key={index}
						className={`h-1.5 rounded-full transition-all duration-300 ${
							index === visibleImageIndex ? "w-6 bg-white" : "w-1.5 bg-zinc-600"
						}`}
						animate={{
							width: index === visibleImageIndex ? 24 : 6,
							backgroundColor:
								index === visibleImageIndex ? "#ffffff" : "#525252",
						}}
						transition={{ duration: 0.3 }}
					/>
				))}
			</motion.div>
		</motion.div>
	);
}
