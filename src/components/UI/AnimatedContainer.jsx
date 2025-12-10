"use client";

import { motion } from "motion/react";
import {
	fadeInBlur,
	fadeInBlurFast,
	fadeInBlurScale,
	staggerContainer,
} from "@/lib/motionVariants";

export default function AnimatedContainer({
	children,
	variant = "fadeInBlur",
	stagger = false,
	delay = 0,
	className = "",
	...props
}) {
	const variants = {
		fadeInBlur,
		fadeInBlurFast,
		fadeInBlurScale,
		staggerContainer,
	};

	const selectedVariant = stagger ? staggerContainer : variants[variant];

	return (
		<motion.div
			variants={selectedVariant}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			transition={{ delay }}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}
