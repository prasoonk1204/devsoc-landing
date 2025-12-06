"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { fadeInBlur } from "@/lib/motionVariants";

export default function NewsletterDesktopGrid({ images, title, onImageClick }) {
	return (
		<motion.div
			className="hidden grid-cols-2 gap-6 md:grid"
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			{images.map((image, index) => (
				<motion.div
					key={index}
					className="group relative w-full cursor-zoom-in overflow-hidden"
					onClick={() => onImageClick(index)}
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 * index }}
					whileTap={{ scale: 0.98 }}
				>
					<Image
						src={image}
						alt={`${title} image ${index + 1}`}
						width={1200}
						height={1600}
						quality={85}
						priority={index < 2}
						placeholder="blur"
						blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIxNjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjE2MDAiIGZpbGw9IiMyNzI3MjciLz48L3N2Zz4="
						className="h-auto w-full rounded-3xl object-cover"
					/>
					<motion.div
						className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
						initial={{ opacity: 0 }}
						whileHover={{ scale: 1.1 }}
					>
						<ZoomIn size={20} />
					</motion.div>
				</motion.div>
			))}
		</motion.div>
	);
}
