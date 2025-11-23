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
import { useRef } from "react";
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
	const cardRef = useRef(null);
	const directionSetRef = useRef(false);

	const handleMouseEnter = (e) => {
		if (!cardRef.current || directionSetRef.current) return;

		const rect = cardRef.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const cardCenter = rect.width / 2;

		// Set flip direction once on enter
		const rotation = mouseX < cardCenter ? "180deg" : "-180deg";
		cardRef.current.style.setProperty("--flip-rotation", rotation);
		directionSetRef.current = true;
	};

	const handleMouseLeave = () => {
		directionSetRef.current = false;
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
			>
				<div
					ref={cardRef}
					className={styles.flipCard}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					style={{ "--flip-rotation": "180deg" }}
				>
					<div className={styles.flipCardFront}>
						<div className="relative h-full w-full">
							<Image
								src={member.image}
								alt={member.name}
								fill
								sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
								className="object-cover object-center"
								priority={index < 6}
							/>
						</div>

						<div className="absolute right-0 bottom-0 left-0 rounded-b-3xl bg-linear-to-b from-black/40 via-black/60 to-black/80 p-4 text-zinc-300 shadow-[inset_0_-4px_4px_rgba(255,255,255,0.15)] backdrop-blur-md">
							<div className="text-lg font-semibold text-white md:text-xl">
								{member.name}
							</div>
							<div className="text-sm md:text-[16px]">{member.designation}</div>
						</div>
					</div>

					<div className={styles.flipCardBack}>
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
				</div>
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
						<div className="relative h-full w-full">
							<Image
								src={member.image}
								alt={member.name}
								fill
								sizes="50vw"
								className="object-contain object-top transition-transform duration-300 group-active:scale-105"
							/>
						</div>

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
