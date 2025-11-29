"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useMemo, useEffect, useState } from "react";
import { LOGO, BACKGROUND_IMG, HERO_IMG } from "@/constant/assets";
import AstronautScene from "./AstronautScene";
import { fadeInBlurFast, fadeInFromBottom } from "@/lib/motionVariants";
import api from "@/lib/axios";

export default function Hero({ onModelLoaded, shouldAnimate, onDataLoaded }) {
	const [communityLinks, setCommunityLinks] = useState(undefined);

	useEffect(() => {
		const fetchLinks = async () => {
			try {
				const res = await api.get("/settings/community-links");
				setCommunityLinks(res.data.data);
			} catch (error) {
				// console.error("Failed to fetch community links:", error);
				setCommunityLinks(null);
			}
		};
		fetchLinks();
	}, []);

	const communityLink = useMemo(() => {
		return communityLinks?.whatsapp || communityLinks?.discord || null;
	}, [communityLinks]);

	useEffect(() => {
		if (communityLinks !== undefined) {
			onDataLoaded?.();
		}
	}, [communityLinks, onDataLoaded]);

	return (
		<div className="to-accent/30 relative flex h-dvh w-full flex-col items-center justify-end bg-linear-to-t from-slate-300 px-4 pt-4 md:h-[768px]">
			<Image
				src={BACKGROUND_IMG}
				alt="DevSoc Background"
				height={887}
				width={1439}
				priority
				quality={85}
				className="absolute inset-0 z-0 h-full w-full object-cover opacity-25"
			/>
			<div className="absolute top-4 left-4 z-2 flex items-center gap-2">
				<Image src={LOGO} alt="DevSoc Logo" height={50} width={50} />
				<h2 className="font-iceland text-2xl font-bold min-[400px]:text-3xl">
					DEV<span className="text-orange-300">SOC</span>
				</h2>
			</div>

			<div className="z-2 flex h-100 w-full flex-col items-center justify-end pb-0 text-center sm:h-90 sm:pb-0 md:pb-8">
				<motion.h1
					variants={fadeInBlurFast}
					initial="hidden"
					whileInView={shouldAnimate ? "visible" : "hidden"}
					viewport={{ once: true }}
					className="text-4xl font-bold min-[400px]:text-5xl sm:text-6xl"
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
					where we build for fun and learn on the way
				</motion.h2>
				{communityLink && (
					<motion.a
						href={communityLink}
						target="_blank"
						rel="noopener noreferrer"
						variants={fadeInBlurFast}
						initial="hidden"
						whileInView={shouldAnimate ? "visible" : "hidden"}
						viewport={{ once: true }}
						className="mt-6 inline-block rounded-3xl bg-zinc-950 px-8 py-2.5 text-lg text-white shadow-lg transition-all duration-200 hover:scale-102 hover:cursor-pointer hover:bg-zinc-900 hover:shadow-xl active:scale-97"
					>
						Step into our space
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
						src={HERO_IMG}
						alt="DevSoc Astronaut"
						fill
						className="object-contain object-bottom"
						priority
						quality={90}
						sizes="(max-width: 768px) 400px, 0px"
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
