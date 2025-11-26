"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { fadeInBlur } from "@/lib/motionVariants";
import { formatEventDate } from "@/lib/utils/eventUtils";

export default function EventCard({ event }) {
	return (
		<motion.div
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			className="group"
		>
			<Link href={`/events/${event.slug}`}>
				<div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl bg-zinc-700 shadow-lg">
					<Image
						src={event.image}
						alt={event.title}
						fill
						className="object-fill"
					/>
					{/* Mobile Overlay: Always visible */}
					{/* <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black to-transparent to-60% p-4 md:hidden">
						<h3 className="text-xl font-semibold text-white">{event.title}</h3>
						<p className="text-zinc-300">{formatEventDate(event.date)}</p>
					</div> */}

					{/* Desktop Overlay: Visible on hover */}
					<div className="hidden md:absolute md:inset-0 md:flex md:flex-col md:justify-end md:bg-linear-to-t md:from-black md:to-transparent md:to-60% md:p-4 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
						<h3 className="font-semibold text-white">{event.title}</h3>
						<p className="text-sm text-zinc-300">
							{formatEventDate(event.date)}
						</p>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
