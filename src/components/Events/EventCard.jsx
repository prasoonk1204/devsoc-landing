"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

// Animation variants for the card
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
	return (
		<motion.div
			variants={cardVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			className="group"
		>
			<Link href={`/events/${event.id}`}>
				<div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-neutral-700 shadow-lg transition-all duration-300 group-hover:shadow-xl">
					<Image
						src={event.image}
						alt={event.title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>

					<div
						className="absolute inset-0 flex flex-col justify-end 
                                   bg-linear-to-t from-black/60 to-transparent to-60% 
                                   p-4 transition-all duration-300 
                                   group-hover:from-black/80"
					>
						<h3 className="text-lg font-semibold text-white sm:text-xl">
							{event.title}
						</h3>
						<p className="text-sm text-neutral-300">{event.date}</p>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}