"use client";

import { use } from "react";
import { eventsData } from "@/constant/events";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import BackButton from "@/components/UI/BackButton";
import EventRegistrationForm from "@/components/Events/EventRegistrationForm";
import { formatEventDate } from "@/lib/utils/eventUtils";

export default function EventRegistrationPage({ params }) {
	const { slug } = use(params);
	const event = eventsData.find((e) => e.slug === slug);

	if (!event) {
		notFound();
	}

	// Check if registration is enabled and this is the latest event
	const isRegistrationEnabled =
		process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "yes" ||
		process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "true";
	const latestEvent = eventsData[eventsData.length - 1];
	const isLatestEvent = event.slug === latestEvent.slug;

	// If registration is not enabled or this is not the latest event, redirect to event page
	if (!isRegistrationEnabled || !isLatestEvent) {
		notFound();
	}

	return (
		<div className="relative flex w-full flex-col items-center justify-center bg-black p-4 pt-20 pb-16 text-white sm:p-6 sm:pb-24 md:pt-40">
			<div className="relative w-full max-w-4xl">
				<BackButton
					href={`/events/${event.slug}`}
					label="Back to event details"
				/>

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
					<p className="text-lg text-neutral-300 sm:text-xl">
						{formatEventDate(event.date)}
					</p>
				</motion.div>

				<EventRegistrationForm event={event} />
			</div>
		</div>
	);
}
