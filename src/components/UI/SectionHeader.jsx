"use client";

import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import { cn } from "@/lib/utils";

export default function SectionHeader({
	title,
	subtitle,
	accent,
	size = "6xl",
	className = "",
	center = true,
	uppercase = false,
}) {
	const sizeClasses = {
		"2xl": "text-2xl",
		"3xl": "text-3xl",
		"4xl": "text-4xl",
		"5xl": "text-5xl",
		"6xl": "text-6xl",
		"7xl": "text-7xl",
	};

	return (
		<motion.div
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			className={cn("mb-8 text-white", center && "text-center", className)}
		>
			<h1
				className={`font-iceland font-bold ${sizeClasses[size]} ${uppercase ? "tracking-widest uppercase" : ""}`}
			>
				{accent ? (
					<>
						{title.split(accent)[0]}
						<span className="text-accent">{accent}</span>
						{title.split(accent)[1]}
					</>
				) : (
					title
				)}
			</h1>
			{subtitle && (
				<p className="mt-2 font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase">
					{subtitle}
				</p>
			)}
		</motion.div>
	);
}
