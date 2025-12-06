"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { fadeInBlurScale } from "@/lib/motionVariants";

export default function NewsletterCard({ item, index }) {
	return (
		<Link href={`/newsletter/${item.slug}`} key={index}>
			<motion.div
				className="flex flex-col overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800/70 hover:cursor-pointer sm:flex-row sm:gap-4"
				variants={fadeInBlurScale}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				whileHover={{
					scale: 1.02,
					borderColor: "rgb(82, 82, 91)",
					transition: {
						duration: 0.2,
						ease: [0.34, 1.56, 0.64, 1],
					},
				}}
				style={{
					willChange: "transform",
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
					transform: "translateZ(0)",
					WebkitTransform: "translateZ(0)",
				}}
			>
				<div className="relative w-full shrink-0 sm:w-auto sm:max-w-[280px]">
					<Image
						src={item.cover}
						alt={item.title}
						width={500}
						height={800}
						quality={80}
						priority={index < 3}
						placeholder="blur"
						blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzI3MjcyNyIvPjwvc3ZnPg=="
						className="h-full w-full object-cover sm:h-auto"
					/>
				</div>
				<div className="flex w-full flex-col justify-center gap-2 p-4 font-sans sm:p-6">
					<h2 className="text-lg leading-tight font-semibold sm:text-2xl">
						{item.title}
					</h2>
					<div className="flex flex-wrap justify-between gap-2 text-sm text-zinc-300 sm:text-lg">
						<p>By {item.author}</p>
						<p>{item.date}</p>
					</div>
				</div>
			</motion.div>
		</Link>
	);
}
