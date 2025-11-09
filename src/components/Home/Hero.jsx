"use client";

import Image from "next/image";
import { motion } from "motion/react";
import AstronautScene from "./AstronautScene";

export default function Hero() {
	const headerVariants = {
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

	const imageVariants = {
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
	return (
		<div className="to-accent/30 relative flex h-screen w-full flex-col items-center bg-linear-to-t from-slate-300 px-4 pt-4 md:h-[768px]">
			<Image
				src="/devsocbg.png"
				alt="DevSoc Background"
				height={887}
				width={1439}
				className="absolute inset-0 z-0 h-full w-full object-cover opacity-25"
			/>
			<div className="absolute top-4 left-4 z-2 flex items-center gap-2">
				<Image src="/DevSocLogo.png" alt="DevSoc Logo" height={50} width={50} />
				<h2 className="font-iceland text-4xl font-bold">
					DEV<span className="text-orange-300">SOC</span>
				</h2>
			</div>

			<div className="z-2 flex h-100 w-full flex-col items-center justify-end pb-0 text-center sm:h-90 sm:pb-0 md:pb-8">
				<motion.h1
					variants={headerVariants}
					initial="hidden"
					whileInView="visible"
					className="text-5xl font-bold sm:text-6xl"
				>
					Welcome to Dev<span className="text-orange-300">Soc</span>
				</motion.h1>
				<motion.h2
					variants={headerVariants}
					initial="hidden"
					whileInView="visible"
					className="text-xl sm:text-2xl"
				>
					Join our inclusive community
				</motion.h2>
				<motion.button
					variants={headerVariants}
					initial="hidden"
					whileInView="visible"
					className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-lg text-white transition-all duration-200 hover:cursor-pointer hover:bg-neutral-800 active:scale-103"
				>
					Join our community
				</motion.button>
			</div>
			{/* <motion.div
				variants={imageVariants}
				initial="hidden"
				whileInView="visible"
				className="absolute bottom-0 z-2  w-full"
			>
				
			</motion.div> */}
			<motion.div
				variants={imageVariants}
				initial="hidden"
				whileInView="visible"
				className="z-2 h-80 w-full sm:h-[400px]"
			>
				<AstronautScene />
			</motion.div>

			{/* <div className="absolute bottom-0 z-2 w-full bg-black md:h-10"></div> */}
		</div>
	);
}
