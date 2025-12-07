"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Globe } from "lucide-react";
import { MorphingText } from "./morphingText";

const socialLinks = [
	{
		name: "Instagram",
		url: "https://www.instagram.com/dev.soc_aec/",
		icon: <Instagram size={20} />,
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/company/development-society-aec/",
		icon: <Linkedin size={20} />,
	},
	{
		name: "Twitter",
		url: "https://x.com/devsoc_aec",
		icon: <Twitter size={20} />,
	},
];

const devLinks = [
	{
		name: "Avik",
		link: "https://www.instagram.com/nate_river007",
		type: "Instagram",
		icon: <Instagram size={16} />,
	},
	{
		name: "Prantor",
		link: "https://x.com/das_prantor",
		type: "twitter",
		icon: <Twitter size={16} />,
	},
	{
		name: "Prasoon",
		link: "https://prasoonk.vercel.app",
		type: "website",
		icon: <Globe size={16} />,
	},
	{
		name: "Princi",
		link: "https://www.linkedin.com/in/princi-kumari-a6422b326",
		type: "linkedin",
		icon: <Linkedin size={16} />,
	},
	{
		name: "Souvik",
		link: "https://www.linkedin.com/in/souvik-majee-4b1b88292/",
		type: "Linkedin",
		icon: <Linkedin size={16} />,
	},
];

const Footer = () => {
	const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
	const [showBlobs, setShowBlobs] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const creditRef = useRef(null);
	const isInView = useInView(creditRef, { margin: "0px 0px -50px 0px" });

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const handleMouseMove = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const relativeY = e.clientY - rect.top;
		setMousePos({ x: e.clientX - rect.left, y: relativeY });
		const threshold = rect.height * 0.35;
		setShowBlobs(relativeY > threshold);
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.25, 0.46, 0.45, 0.94],
			},
		},
	};

	const socialIconVariants = {
		hidden: { opacity: 0, scale: 0 },
		visible: (i) => ({
			opacity: 1,
			scale: 1,
			transition: {
				delay: i * 0.1,
				duration: 0.2,
				ease: "backOut",
			},
		}),
	};

	const devsocVariants = {
		hidden: {
			opacity: 0,
			y: 50,
			filter: "blur(10px)",
		},
		visible: {
			opacity: 1,
			y: 0,
			filter: "blur(0px)",
			transition: {
				duration: 0.5,
				ease: [0.25, 0.46, 0.45, 0.94],
			},
		},
	};

	const copyrightVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				delay: 0.6,
				duration: 0.6,
			},
		},
	};

	return (
		<motion.div
			className="relative w-full overflow-hidden rounded-t-3xl border-t border-white/30 bg-black p-4 pt-12 text-white shadow-[2px_-2px_4px_rgba(0,0,0,0.5)_inset,-2px_-2px_4px_rgba(0,0,0,0.5)_inset,0_2px_8px_rgba(255,255,255,0.3)_inset] sm:pt-10"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setShowBlobs(false)}
		>
			{showBlobs && (
				<>
					<div
						className="bg-accent pointer-events-none absolute h-32 w-32 rounded-full opacity-30 blur-3xl transition-transform duration-300 sm:h-40 sm:w-40"
						style={{
							top: mousePos.y - (isMobile ? 64 : 80),
							left: mousePos.x - (isMobile ? 64 : 80),
							zIndex: 20,
						}}
					></div>
					<div
						className="bg-accent pointer-events-none absolute h-24 w-24 rounded-full opacity-20 blur-2xl transition-transform duration-300 sm:h-32 sm:w-32"
						style={{
							top: mousePos.y - (isMobile ? 48 : 60),
							left: mousePos.x - (isMobile ? 48 : 60),
							zIndex: 20,
						}}
					></div>
					<div
						className="bg-accent pointer-events-none absolute h-20 w-20 rounded-full opacity-30 blur-2xl transition-transform duration-300 sm:h-24 sm:w-24"
						style={{
							top: mousePos.y - (isMobile ? 40 : 40),
							left: mousePos.x - (isMobile ? 40 : 40),
							zIndex: 20,
						}}
					></div>
				</>
			)}

			<div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
				<motion.div
					className="relative flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-center md:justify-start"
					variants={itemVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					onMouseEnter={() => !isMobile && setIsHovered(true)}
					onMouseLeave={() => !isMobile && setIsHovered(false)}
					ref={creditRef}
				>
					<span className="text-lg whitespace-nowrap text-zinc-300 sm:text-base md:text-lg">
						Made with ❤️ by
					</span>
					<div className="relative inline-flex h-7 min-w-[95px] items-center justify-start overflow-hidden sm:h-6 sm:min-w-0 sm:overflow-visible md:h-7">
						<AnimatePresence mode="wait" initial={false}>
							{isHovered ? (
								<motion.div
									key="full-list"
									initial={{ opacity: 0, scaleX: 0.8 }}
									animate={{ opacity: 1, scaleX: 1 }}
									exit={{ opacity: 0, scaleX: 0.8 }}
									transition={{
										duration: 0.3,
										ease: [0.34, 1.56, 0.64, 1],
									}}
									className="inline-flex items-center whitespace-nowrap"
								>
									{devLinks.map((dev, index) => (
										<span
											key={dev.name}
											className="inline-flex text-lg font-medium text-white sm:text-base md:text-lg"
										>
											<DevLink dev={dev} isMobile={isMobile} />
											{index < devLinks.length - 2 && ",\u00A0"}
											{index === devLinks.length - 2 && "\u00A0&\u00A0"}
										</span>
									))}
								</motion.div>
							) : (
								<motion.div
									key="morphing-text"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{
										duration: 0.25,
										ease: [0.4, 0, 0.2, 1],
									}}
									className="inline-flex items-center"
									style={{ transform: "translate3d(0, 0, 0)" }}
								>
									{isInView && (
										<MorphingText
											texts={devLinks.map((dev) => dev.name)}
											links={devLinks.map((dev) => dev.link)}
											customTimings={[2, 2, 0.8, 0.3, 0.8]} // P, P, P, S, A
											className="text-lg font-bold text-white sm:text-base md:text-lg"
										/>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>

				<motion.div
					className="flex items-center justify-center gap-3 sm:justify-start sm:gap-4"
					variants={itemVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<h1 className="text-base text-zinc-300 sm:text-lg">Follow us on</h1>
					{socialLinks.map((link, i) => (
						<Link
							key={link.name}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<motion.div
								className="hover:text-accent hover:border-accent rounded-full border border-zinc-700/50 bg-zinc-800/80 p-3 text-xl transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-700/80 hover:shadow-lg hover:shadow-orange-500/20"
								custom={i}
								initial="hidden"
								whileInView="visible"
								variants={socialIconVariants}
								whileTap={{ scale: 0.9 }}
								viewport={{ once: true }}
							>
								{link.icon}
							</motion.div>
						</Link>
					))}
				</motion.div>
			</div>

			<motion.div
				className="sm:space-x-auto mt-12 bg-linear-to-b from-white/50 via-[#1c1c1c] to-[#000000b9] bg-clip-text text-center text-[5rem] leading-none font-bold text-transparent font-stretch-50% select-none sm:text-[10rem] md:px-4 md:text-[12rem] lg:text-[14rem] xl:text-[18rem]"
				variants={devsocVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
			>
				DEVSOC
			</motion.div>

			<motion.h2
				className="text-center text-sm text-gray-400 sm:text-[15px]"
				variants={copyrightVariants}
				viewport={{ once: true }}
				initial="hidden"
				whileInView="visible"
			>
				© {new Date().getFullYear()} DevSoc. All rights reserved.
			</motion.h2>
		</motion.div>
	);
};

export default Footer;

const DevLink = ({ dev, isMobile }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	if (isMobile) {
		return (
			<Link
				href={dev.link}
				target="_blank"
				rel="noopener noreferrer"
				className="tracking-wide transition-colors duration-200 ease-out active:text-orange-400"
			>
				{dev.name}
			</Link>
		);
	}

	return (
		<span className="relative inline-block">
			<Link
				href={dev.link}
				target="_blank"
				rel="noopener noreferrer"
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				className="hover:text-accent tracking-wide transition-colors duration-200 ease-out"
			>
				{dev.name}
			</Link>
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, y: 5, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 5, scale: 0.95 }}
						transition={{
							duration: 0.15,
							ease: [0.4, 0, 0.2, 1],
						}}
						className="absolute -top-9 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-zinc-600 bg-zinc-800/95 px-2.5 py-1.5 shadow-xl backdrop-blur-sm will-change-transform"
						style={{ transform: "translateZ(0)" }}
					>
						<div className="flex items-center gap-1 text-zinc-200">
							{dev.icon}
						</div>
						<div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-zinc-600 bg-zinc-800/95"></div>
					</motion.div>
				)}
			</AnimatePresence>
		</span>
	);
};
