"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { DirectionAwareHover } from "@/components/UI/directionAwareHover";

const cardVariants = {
	hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
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

export default function EventCard({ event }) {
	const [mounted, setMounted] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		setMounted(true);
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	if (!mounted) {
		return (
			<div className="group">
				<Link href={`/events/${event.id}`}>
					<div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-700 shadow-lg md:aspect-auto md:h-[400px]">
						<img
							src={event.image}
							alt={event.title}
							className="h-full w-full object-cover"
						/>
						<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent to-60% p-4">
							<h3 className="text-lg font-semibold text-white sm:text-xl">
								{event.title}
							</h3>
							<p className="text-sm text-neutral-300">{event.date}</p>
						</div>
					</div>
				</Link>
			</div>
		);
	}

	// Mobile view - Simple card with gradient overlay
	if (isMobile) {
		return (
			<motion.div
				variants={cardVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				className="group"
			>
				<Link href={`/events/${event.id}`}>
					<div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-700 shadow-lg">
						<Image
							src={event.image}
							alt={event.title}
							fill
							sizes="100vw"
							className="object-cover"
						/>
						<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent to-60% p-4">
							<h3 className="text-lg font-semibold text-white">
								{event.title}
							</h3>
							<p className="text-sm text-neutral-300">{event.date}</p>
						</div>
					</div>
				</Link>
			</motion.div>
		);
	}

	// Desktop view - DirectionAwareHover
	return (
		<motion.div
			variants={cardVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			className="relative flex h-[400px] items-center justify-center"
		>
			<Link href={`/events/${event.id}`} className="h-full w-full">
				<DirectionAwareHover imageUrl={event.image} className="h-full w-full">
					<p className="text-xl font-bold">{event.title}</p>
					<p className="text-sm font-normal">{event.date}</p>
				</DirectionAwareHover>
			</Link>
		</motion.div>
	);
}
