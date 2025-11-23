"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
	Github,
	Linkedin,
	Twitter,
	Globe,
	Mail,
	Instagram,
} from "lucide-react";
import { fadeInBlur } from "@/lib/motionVariants";
import { useState } from "react";
import styles from "./MemberCard.module.css";

const socialIcons = {
	github: Github,
	linkedin: Linkedin,
	twitter: Twitter,
	instagram: Instagram,
	website: Globe,
	email: Mail,
};

export default function MemberCard({ member, index }) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [direction, setDirection] = useState(0);

	const handleMouseEnter = (e) => {
		const card = e.currentTarget;
		const rect = card.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const cardCenter = rect.width / 2;

		// Determine direction: if entering from left, rotate positive (clockwise from top)
		// If entering from right, rotate negative
		// Actually, standard flip:
		// Mouse on left -> rotate Y 180
		// Mouse on right -> rotate Y -180
		const newDirection = mouseX < cardCenter ? 180 : -180;
		setDirection(newDirection);
		setIsFlipped(true);
	};

	const handleMouseLeave = () => {
		setIsFlipped(false);
	};

	return (
		<>
			{/* Desktop card */}
			<motion.div
				variants={fadeInBlur}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-50px" }}
				transition={{ delay: index * 0.05 }}
				className={`${styles.flipCardContainer} hidden md:block`}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<motion.div
					className={styles.flipCard}
					animate={{ rotateY: isFlipped ? direction : 0 }}
					transition={{
						duration: 0.6,
						type: "spring",
						stiffness: 260,
						damping: 20,
					}}
				>
					<div className={styles.flipCardFront}>
						<Image
							src={member.image}
							alt={member.name}
							height={500}
							width={500}
						/>
						<div className="absolute right-0 bottom-0 left-0 rounded-b-3xl bg-linear-to-b from-black/40 via-black/60 to-black/80 p-4 text-zinc-300 shadow-[inset_0_-4px_4px_rgba(255,255,255,0.15)] backdrop-blur-md">
							<div className="text-lg font-semibold text-white md:text-xl">
								{member.name}
							</div>
							<div className="text-sm md:text-[16px]">{member.designation}</div>
						</div>
					</div>

					<div
						className={styles.flipCardBack}
						style={{ transform: "rotateY(180deg)" }}
					>
						<div className="flex h-full flex-col items-center justify-center gap-6 p-6">
							<div className="text-center">
								<h3 className="mb-1 text-lg font-bold text-white">
									{member.name}
								</h3>
								<p className="text-sm text-neutral-300">{member.designation}</p>
							</div>

							{member.socials && Object.keys(member.socials).length > 0 ? (
								<div className="flex flex-wrap items-center justify-center gap-4">
									{Object.entries(member.socials).map(([platform, url]) => {
										const Icon = socialIcons[platform];
										if (!Icon || !url) return null;

										return (
											<Link
												key={platform}
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="rounded-full bg-white/10 p-3 text-white transition-all duration-200 hover:scale-110 hover:bg-orange-300"
												onClick={(e) => e.stopPropagation()}
											>
												<Icon size={22} />
											</Link>
										);
									})}
								</div>
							) : (
								""
							)}
						</div>
					</div>
				</motion.div>
			</motion.div>

			{/* Mobile Card */}
			<motion.div
				variants={fadeInBlur}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-50px" }}
				transition={{ delay: index * 0.05 }}
				className="block md:hidden"
			>
				<Link
					href={member.socials?.linkedin || member.socials?.github || "#"}
					target="_blank"
					rel="noopener noreferrer"
					className="group block"
				>
					<div className="relative mx-auto h-60 w-full max-w-[350px] overflow-hidden rounded-3xl bg-linear-to-b from-zinc-800 to-zinc-950 font-sans text-white transition-all duration-300">
						<Image
							src={member.image}
							alt={member.name}
							height={500}
							width={500}
						/>

						<div className="absolute right-0 bottom-0 left-0 rounded-b-3xl bg-linear-to-b from-black/40 via-black/60 to-black/80 p-4 text-zinc-300 shadow-[inset_0_-4px_4px_rgba(255,255,255,0.15)] backdrop-blur-md">
							<div className="text-lg font-semibold text-white md:text-xl">
								{member.name}
							</div>
							<div className="text-sm md:text-[16px]">{member.designation}</div>
						</div>
					</div>
				</Link>
			</motion.div>
		</>
	);
}
