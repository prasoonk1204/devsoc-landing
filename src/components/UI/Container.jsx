"use client";

export default function Container({
	children,
	maxWidth = "6xl",
	className = "",
	padding = "px-4",
}) {
	const maxWidthClasses = {
		"4xl": "max-w-4xl",
		"5xl": "max-w-5xl",
		"6xl": "max-w-6xl",
		"7xl": "max-w-7xl",
		full: "max-w-full",
	};

	return (
		<div
			className={`mx-auto w-full ${maxWidthClasses[maxWidth]} ${padding} ${className}`}
		>
			{children}
		</div>
	);
}
