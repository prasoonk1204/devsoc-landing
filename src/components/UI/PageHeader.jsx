"use client";

import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";

export default function PageHeader({ title, subtitle }) {
	return (
		<div className="mb-12 w-full text-center">
			<motion.h1
				className="font-iceland mb-1 text-6xl font-bold"
				variants={fadeInBlur}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
			>
				{title}
			</motion.h1>
			{subtitle && (
				<motion.p
					className="text-xl text-zinc-200"
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					{subtitle}
				</motion.p>
			)}
		</div>
	);
}
