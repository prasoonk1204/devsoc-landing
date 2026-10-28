"use client";

import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import BackButton from "@/components/UI/BackButton";
import EventRegistrationForm from "@/components/Events/EventRegistrationForm";
import { formatEventDate } from "@/lib/utils/eventUtils";

export default function EventRegistrationPage({ event }) {
	return (
		<div className="relative flex w-full flex-col items-center justify-center bg-black p-4 pt-20 pb-16 text-white sm:p-6 sm:pt-20 sm:pb-24 md:pt-40">
			<div className="relative w-full max-w-4xl">
				<BackButton href="/events" label="All events" />

				<motion.div
					className="mt-6 mb-8 text-center"
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<h1 className="font-iceland mb-2 text-4xl font-bold text-white sm:text-6xl">
						{event.title}
					</h1>
					<p className="text-lg text-zinc-300 sm:text-xl">
						{formatEventDate(event.date)}
					</p>
				</motion.div>

				<EventRegistrationForm event={event} />
			</div>
		</div>
	);
}
