"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
	LOGO,
	BACKGROUND_IMG,
	HERO_IMG,
	WHATSAPP_LINK,
	DISCORD_LINK,
} from "@/constant/assets";
import AstronautScene from "./AstronautScene";
import { fadeInBlurFast, fadeInFromBottom } from "@/lib/motionVariants";

export default function Hero({ onModelLoaded, shouldAnimate, onDataLoaded }) {
	const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);

	useEffect(() => {
		onDataLoaded?.();
	}, [onDataLoaded]);

	return (
		<div className="to-accent/30 relative flex h-dvh w-full flex-col items-center justify-end bg-linear-to-t from-slate-300 px-4 pt-4 md:h-[768px]">
			<Image
				src={BACKGROUND_IMG}
				alt="DevSoc Background"
				fill
				priority
				quality={85}
				sizes="100vw"
				className="absolute inset-0 z-0 object-cover object-center opacity-25 md:object-cover"
				style={{
					objectPosition: "center center",
				}}
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
				<motion.div
					variants={fadeInBlurFast}
					initial="hidden"
					whileInView={shouldAnimate ? "visible" : "hidden"}
					viewport={{ once: true }}
					onHoverStart={() => setIsCommunityMenuOpen(true)}
					onHoverEnd={() => setIsCommunityMenuOpen(false)}
					className="relative mt-6 h-13 w-full max-w-74"
				>
					<AnimatePresence initial={false}>
						{isCommunityMenuOpen ? (
							<motion.div
								key="community-links"
								initial={{ opacity: 0, scale: 0.92 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.92 }}
								transition={{ type: "spring", stiffness: 420, damping: 30 }}
								className="absolute inset-0 flex gap-1.5 rounded-4xl bg-zinc-950/95 p-1.5 shadow-xl backdrop-blur-sm"
							>
								<a
									href={WHATSAPP_LINK}
									target="_blank"
									rel="noopener noreferrer"
									className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[#25D366] px-3 py-2.5 text-base font-semibold text-zinc-950 transition-transform hover:scale-105"
								>
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										className="size-5 fill-current"
									>
										<path d="M12 2a9.9 9.9 0 0 0-8.55 14.9L2 22l5.25-1.38A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.13l-.3-.18-3.12.82.84-3.04-.2-.31A8 8 0 1 1 12 20Zm4.38-5.97c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.43-.72-2.37-1.28-3.32-2.9-.25-.43.25-.4.72-1.32.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.56 4.07 3.59 1.51.65 2.1.7 2.85.59.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
									</svg>
									WhatsApp
								</a>
								<a
									href={DISCORD_LINK}
									target="_blank"
									rel="noopener noreferrer"
									className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[#5865F2] px-3 py-2.5 text-base font-semibold text-white transition-transform hover:scale-105"
								>
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										className="size-5 fill-current"
									>
										<path d="M19.54 5.16A16.4 16.4 0 0 0 15.5 4l-.5 1.02a14.9 14.9 0 0 0-6 0L8.5 4a16.4 16.4 0 0 0-4.04 1.16C1.9 9.02 1.2 12.8 1.55 16.53A16.3 16.3 0 0 0 6.5 19l1.2-1.65c-.66-.24-1.3-.55-1.9-.91l.46-.35c3.66 1.7 7.63 1.7 11.25 0l.46.35c-.6.36-1.24.67-1.9.91L17.27 19a16.3 16.3 0 0 0 4.95-2.47c.41-4.32-.7-8.07-2.68-11.37ZM8.8 14.1c-1.07 0-1.95-.98-1.95-2.18s.86-2.18 1.95-2.18 1.96.98 1.95 2.18c0 1.2-.86 2.18-1.95 2.18Zm6.4 0c-1.07 0-1.95-.98-1.95-2.18s.86-2.18 1.95-2.18 1.96.98 1.95 2.18c0 1.2-.86 2.18-1.95 2.18Z" />
									</svg>
									Discord
								</a>
							</motion.div>
						) : (
							<motion.button
								key="community-trigger"
								type="button"
								onClick={() => setIsCommunityMenuOpen(true)}
								aria-expanded={false}
								className="absolute inset-0 rounded-4xl bg-zinc-950 px-8 py-2.5 text-lg text-white shadow-lg transition-colors hover:cursor-pointer hover:bg-zinc-900 active:scale-97"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.97 }}
								initial={{ opacity: 0, scale: 0.92 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.92 }}
								transition={{ type: "spring", stiffness: 420, damping: 30 }}
							>
								Click to Join
							</motion.button>
						)}
					</AnimatePresence>
				</motion.div>
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
