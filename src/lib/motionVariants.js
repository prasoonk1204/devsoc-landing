// Common fade in with blur effect
export const fadeInBlur = {
	hidden: {
		opacity: 0,
		y: 30,
		filter: "blur(10px)",
	},
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: {
			duration: 0.4,
			ease: "easeOut",
		},
	},
};

// Faster fade in with blur (for headers)
export const fadeInBlurFast = {
	hidden: {
		opacity: 0,
		y: 20,
		filter: "blur(10px)",
	},
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: {
			duration: 0.3,
			ease: "easeOut",
		},
	},
};

// Fade in with blur and scale (for cards)
export const fadeInBlurScale = {
	hidden: {
		opacity: 0,
		y: 30,
		scale: 0.97,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
};

// Fade in from bottom with blur (for images/scenes)
export const fadeInFromBottom = {
	hidden: {
		opacity: 0,
		y: 100,
		filter: "blur(10px)",
	},
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: {
			delay: 0.5,
			duration: 0.5,
			ease: "easeOut",
		},
	},
};

// Hover scale effect
export const hoverScale = {
	hover: {
		scale: 1.01,
		backgroundColor: "rgba(38, 38, 38, 1)",
		transition: { duration: 0.2 },
	},
};

// Stagger children container
export const staggerContainer = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

// Direction aware hover variants (for DirectionAwareHover component)
export const directionAwareVariants = {
	initial: {
		x: 0,
	},
	exit: {
		x: 0,
		y: 0,
	},
	top: {
		y: 20,
	},
	bottom: {
		y: -20,
	},
	left: {
		x: 20,
	},
	right: {
		x: -20,
	},
};

export const directionAwareTextVariants = {
	initial: {
		y: 0,
		x: 0,
		opacity: 0,
	},
	exit: {
		y: 0,
		x: 0,
		opacity: 0,
	},
	top: {
		y: -20,
		opacity: 1,
	},
	bottom: {
		y: 2,
		opacity: 1,
	},
	left: {
		x: -2,
		opacity: 1,
	},
	right: {
		x: 20,
		opacity: 1,
	},
};
