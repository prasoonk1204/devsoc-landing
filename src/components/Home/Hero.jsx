"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import AstronautScene from "./AstronautScene";
import { fadeInBlurFast, fadeInFromBottom } from "@/lib/motionVariants";

export default function Hero({ onModelLoaded, shouldAnimate }) {
	// Fetch community links from settings
	const communityLinks = useQuery(api.settings.getCommunityLinks, {});
	return (
		<div className="to-accent/30 relative flex h-dvh w-full flex-col items-center justify-end bg-linear-to-t from-slate-300 px-4 pt-4 md:h-[768px]">
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
					variants={fadeInBlurFast}
					initial="hidden"
					whileInView={shouldAnimate ? "visible" : "hidden"}
					viewport={{ once: true }}
					className="text-5xl font-bold sm:text-6xl"
				>
					Welcome to Dev<span className="text-orange-300">Soc</span>
				</motion.h1>
				<motion.h2
					variants={fadeInBlurFast}
					initial="hidden"
					whileInView={shouldAnimate ? "visible" : "hidden"}
					viewport={{ once: true }}
					className="text-xl sm:text-2xl"
				>
					Join our inclusive community
				</motion.h2>
				{(communityLinks?.whatsapp || communityLinks?.discord) && (
					<motion.a
						href={communityLinks?.whatsapp || communityLinks?.discord}
						target="_blank"
						rel="noopener noreferrer"
						variants={fadeInBlurFast}
						initial="hidden"
						whileInView={shouldAnimate ? "visible" : "hidden"}
						viewport={{ once: true }}
						className="mt-6 rounded-3xl bg-neutral-900 px-8 py-2.5 text-lg text-white transition-all duration-200 hover:scale-102 hover:cursor-pointer hover:bg-neutral-800 active:scale-97"
					>
						Join our community
					</motion.a>
				)}
			</div>

			<motion.div
				variants={fadeInFromBottom}
				initial="hidden"
				whileInView={shouldAnimate ? "visible" : "hidden"}
				viewport={{ once: true }}
				className="flex h-[400px] w-full justify-center md:hidden"
			>
				<div className="relative h-full w-full max-w-[400px]">
					<Image
						src="/DevsocHero.png"
						alt="DevSoc Astronaut"
						fill
						className="object-contain object-bottom"
						priority
					/>
				</div>
			</motion.div>
			<motion.div
				variants={fadeInFromBottom}
				initial="hidden"
				whileInView={shouldAnimate ? "visible" : "hidden"}
				viewport={{ once: true }}
				className="z-2 hidden h-[400px] w-full md:block"
			>
				<AstronautScene
					onModelLoaded={onModelLoaded}
					shouldAnimate={shouldAnimate}
				/>
			</motion.div>

			{/* <div className="absolute bottom-0 z-2 w-full bg-black md:h-10"></div> */}
		</div>
	);
}
