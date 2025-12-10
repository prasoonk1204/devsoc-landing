"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function Button({
	children,
	variant = "primary",
	size = "md",
	href,
	onClick,
	disabled = false,
	className = "",
	icon,
	iconPosition = "right",
	...props
}) {
	const baseClasses =
		"inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none";

	const variants = {
		primary:
			"bg-zinc-950 text-white hover:bg-zinc-800 hover:scale-102 active:scale-97",
		secondary:
			"bg-zinc-900 text-zinc-200 border border-accent/50 hover:text-white hover:gap-3",
		accent: "bg-accent text-black hover:bg-accent/90",
		ghost: "bg-white/10 text-white hover:bg-white/20",
	};

	const sizes = {
		sm: "px-4 py-2 text-sm rounded-lg",
		md: "px-6 py-2.5 text-base rounded-3xl",
		lg: "px-8 py-3 text-lg rounded-3xl",
	};

	const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

	const content = (
		<>
			{icon && iconPosition === "left" && icon}
			{children}
			{icon && iconPosition === "right" && icon}
		</>
	);

	if (href) {
		return (
			<Link href={href} className={classes} {...props}>
				{content}
			</Link>
		);
	}

	return (
		<motion.button
			className={classes}
			onClick={onClick}
			disabled={disabled}
			whileHover={disabled ? {} : { scale: variant === "primary" ? 1.02 : 1 }}
			whileTap={disabled ? {} : { scale: variant === "primary" ? 0.97 : 1 }}
			{...props}
		>
			{content}
		</motion.button>
	);
}
