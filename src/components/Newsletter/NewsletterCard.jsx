"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { fadeInBlurScale, hoverScale } from "@/lib/motionVariants";

export default function NewsletterCard({ item, index }) {
	return (
		<Link href={`/newsletter/${item.slug}`} key={index}>
			<motion.div
				className="flex flex-col rounded-3xl border border-zinc-700 bg-zinc-800/70 transition-colors duration-300 hover:cursor-pointer sm:flex-row sm:gap-4"
				variants={{ ...fadeInBlurScale, ...hoverScale }}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				whileHover="hover"
			>
				<Image
					src={item.cover}
					alt={item.title}
					width={500}
					height={800}
					className="w-full rounded-t-3xl sm:h-50 sm:w-fit sm:rounded-t-none sm:rounded-l-3xl"
				/>
				<div className="flex w-full flex-col justify-center gap-2 p-4 font-sans">
					<h2 className="text-lg font-semibold sm:text-2xl">{item.title}</h2>
					<div className="flex justify-between text-sm text-zinc-300 sm:text-lg">
						<p>By {item.author}</p>
						<p>{item.date}</p>
					</div>
				</div>
			</motion.div>
		</Link>
	);
}
