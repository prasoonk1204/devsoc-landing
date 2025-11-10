"use client";

import EventCard from "@/components/Events/EventCard";
import { eventsData } from "@/constant/events";
import { motion, stagger } from "motion/react";

const variants = {
	hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

export default function Page() {
	return (
		<div className="min-h-screen w-full bg-black text-white">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8 md:py-24">
				<div className="mb-12 w-full text-center">
					<motion.h1
						className="font-iceland mb-1 text-6xl font-bold"
						variants={variants}
						initial="hidden"
						animate="visible"
					>
						Events
					</motion.h1>
					<motion.p
						className="text-xl text-neutral-200"
						variants={variants}
						initial="hidden"
						animate="visible"
					>
						Where Technology Meets Creativity and Collaboration
					</motion.p>
				</div>

				<motion.div
					className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-0 lg:grid-cols-3 xl:grid-cols-4"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
				>
					{eventsData.map((event) => (
						<motion.div key={event.id} variants={variants}>
							<EventCard event={event} />
						</motion.div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
