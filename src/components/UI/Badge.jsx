"use client";

export default function Badge({
	children,
	variant = "default",
	size = "sm",
	className = "",
}) {
	const variants = {
		default: "bg-white/5 text-zinc-400",
		accent: "bg-accent/10 text-accent border border-accent/30",
		success: "bg-green-500/10 text-green-400 border border-green-500/30",
		warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
		error: "bg-red-500/10 text-red-400 border border-red-500/30",
	};

	const sizes = {
		xs: "px-2 py-0.5 text-xs",
		sm: "px-2.5 py-1 text-xs",
		md: "px-3 py-1.5 text-sm",
	};

	return (
		<span
			className={`inline-flex items-center rounded font-mono font-medium ${variants[variant]} ${sizes[size]} ${className}`}
		>
			{children}
		</span>
	);
}
