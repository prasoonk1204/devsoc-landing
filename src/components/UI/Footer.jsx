"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Globe } from "lucide-react";

const socialLinks = [
	{
		name: "Instagram",
		url: "https://www.instagram.com/dev-soc_aec",
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
		name: "Princi",
		link: "https://www.linkedin.com/in/princi-kumari-a6422b326",
		type: "linkedin",
		icon: <Linkedin size={16} />,
	},
	{
		name: "Prasoon",
		link: "https://prasoonk.vercel.app",
		type: "website",
		icon: <Globe size={16} />,
	},
	{
		name: "Prantor",
		link: "https://x.com/das_prantor",
		type: "twitter",
		icon: <Twitter size={16} />,
	},
	{
		name: "Souvik",
		link: "https://www.linkedin.com/in/souvik-majee-4b1b88292/",
		type: "Linkedin",
		icon: <Linkedin size={16} />,
	},
	{
		name: "Avik",
		link: "https://www.instagram.com/nate_river007",
		type: "Instagram",
		icon: <Instagram size={16} />,
	},
	{
		name: "Pravanjan",
		link: "https://www.linkedin.com/in/pravanjan-roy-bb0a1a383",
		type: "Linkedin",
		icon: <Linkedin size={16} />,
	},
];

const Footer = () => {
	const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
	const [showBlobs, setShowBlobs] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

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

			<div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between md:flex-row">
				<motion.div
					className="text-md mb-4 text-center sm:text-base"
					variants={itemVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					Made with ❤️ by{" "}
					{devLinks.map((dev, index) => (
						<span key={dev.name}>
							<DevLink dev={dev} />
							{index === 0 && ", "}
							{index === 1 && ", "}
							{index === 2 && ", "}
							{index === 3 && ", "}
							{index === 4 && " & "}
						</span>
					))}
				</motion.div>

				<motion.div
					className="mb-4 flex items-center justify-center gap-2 sm:justify-start sm:gap-3"
					variants={itemVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<h1>Follow us on</h1>
					{socialLinks.map((link, i) => (
						<Link
							key={link.name}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<motion.div
								className="hover:border-accent hover:text-accent rounded-full border border-transparent bg-neutral-800/80 p-3 text-xl transition-all duration-300 hover:-translate-y-1"
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
				className="sm:space-x-auto mt-10 bg-linear-to-b from-white/50 via-[#1c1c1c] to-[#000000b9] bg-clip-text text-center text-[5rem] leading-none font-bold text-transparent font-stretch-50% select-none sm:text-[10rem] md:px-4 md:text-[12rem] lg:text-[14rem] xl:text-[18rem]"
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

const DevLink = ({ dev }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<span className="relative inline-block">
			<Link
				href={dev.link}
				target="_blank"
				rel="noopener noreferrer"
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				className="hover:text-accent tracking-wide transition-colors duration-200"
			>
				{dev.name}
			</Link>
			{showTooltip && (
				<motion.div
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					className="absolute -top-8 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 shadow-lg"
				>
					<div className="flex items-center gap-1 text-white">{dev.icon}</div>
					<div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-neutral-700 bg-neutral-800"></div>
				</motion.div>
			)}
		</span>
	);
};
