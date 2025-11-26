"use client";

import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";

export default function NewsletterHeader({ title, author, date }) {
	return (
		<motion.div
			className="mt-6 mb-8 flex flex-col gap-2 border-b border-zinc-700 pb-4 font-sans"
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<h1 className="text-4xl text-white">{title}</h1>
			<div className="flex flex-col justify-between text-zinc-300 sm:flex-row sm:text-lg">
				<p>By {author}</p>
				<p>{date}</p>
			</div>
		</motion.div>
	);
}
