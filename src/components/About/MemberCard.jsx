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
import { useState, useCallback, useEffect, useRef } from "react";
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
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const cardRef = useRef(null);

	// Detect touch device
	useEffect(() => {
		setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
	}, []);

	const handleClick = useCallback(
		(e) => {
			// Only handle click on touch devices
			if (isTouchDevice) {
				e.preventDefault();
				e.stopPropagation();
				setIsFlipped((prev) => !prev);
			}
		},
		[isTouchDevice],
	);

	const handleMouseEnter = useCallback(() => {
		if (!isTouchDevice) {
			setIsFlipped(true);
		}
	}, [isTouchDevice]);

	const handleMouseLeave = useCallback(() => {
		if (!isTouchDevice) {
			setIsFlipped(false);
		}
	}, [isTouchDevice]);

	// Close card when clicking outside (only for touch devices)
	useEffect(() => {
		if (!isTouchDevice) return;

		const handleClickOutside = (event) => {
			if (cardRef.current && !cardRef.current.contains(event.target)) {
				setIsFlipped(false);
			}
		};

		if (isFlipped) {
			document.addEventListener("touchstart", handleClickOutside);
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("touchstart", handleClickOutside);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isFlipped, isTouchDevice]);

	const hasSocials = member.socials && Object.keys(member.socials).length > 0;

	return (
		<motion.div
			ref={cardRef}
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			transition={{ delay: index * 0.05 }}
			className={styles.flipCardContainer}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<motion.div
				className={styles.flipCard}
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{
					duration: 0.6,
					ease: [0.4, 0, 0.2, 1],
				}}
				style={{ transformStyle: "preserve-3d" }}
			>
				{/* Front */}
				<div className={styles.flipCardFront}>
					<Image
						src={member.image}
						alt={member.name}
						height={500}
						width={500}
						quality={80}
						priority={index < 8}
						placeholder="blur"
						blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzI3MjcyNyIvPjwvc3ZnPg=="
					/>
					<div className="absolute right-0 bottom-0 left-0 rounded-b-3xl bg-linear-to-b from-black/40 via-black/60 to-black/80 p-4 text-zinc-300 shadow-[inset_0_-4px_4px_rgba(255,255,255,0.15)] backdrop-blur-md">
						<div className="text-lg font-semibold text-white">
							{member.name}
						</div>
						<div className="text-sm">{member.designation}</div>
					</div>
				</div>

				{/* Back */}
				<div className={styles.flipCardBack}>
					<div className="flex h-full flex-col items-center justify-center gap-6 p-6">
						<div className="text-center">
							<h3 className="mb-1 text-lg font-bold text-white">
								{member.name}
							</h3>
							<p className="text-sm text-zinc-300">{member.designation}</p>
						</div>

						{hasSocials && (
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
											className="rounded-full bg-white/10 p-3 text-white transition-all duration-200 hover:scale-110 hover:bg-orange-300 active:scale-95"
											onClick={(e) => e.stopPropagation()}
										>
											<Icon size={22} />
										</Link>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
