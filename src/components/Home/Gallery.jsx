"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { galleryItems } from "@/constant/gallery";
import Image from "next/image";
import { fadeInBlur, staggerContainer } from "@/lib/motionVariants";

export default function Gallery() {
	return (
		<section className="bg-accent/20 w-full pt-0 pb-24 md:pt-8">
			<div className="mx-auto max-w-6xl px-4">
				<motion.h2
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="font-iceland mb-12 text-6xl font-bold"
				>
					Gallery
				</motion.h2>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={staggerContainer}
					className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
				>
					{galleryItems.map((item, index) => (
						<motion.div
							key={index}
							variants={fadeInBlur}
							whileHover={{ scale: 1.03 }}
							className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl shadow-[0_1px_1px_rgba(0,0,0,0.15),0_4px_6px_rgba(34,42,53,0.14),0_24px_68px_rgba(47,48,55,0.15),0_2px_3px_rgba(0,0,0,0.14)]"
						>
							<Image
								src={item.image}
								alt={item.title}
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
								className="bg-zinc-700 object-cover transition-all duration-200 group-hover:brightness-75"
							/>

							<div className="absolute inset-0 flex items-end bg-linear-to-t from-black to-transparent to-60% p-4">
								<div className="flex w-full items-center justify-between">
									<h3 className="text-lg font-semibold text-white">
										{item.title}
									</h3>
									<ChevronRight className="h-5 w-5 text-white transition group-hover:translate-x-1" />
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
