"use client";

import EventCard from "@/components/Events/EventCard";
import { eventsData } from "@/constant/events";
import { motion } from "motion/react";
import { fadeInBlur, staggerContainer } from "@/lib/motionVariants";
import PageContainer from "@/components/UI/PageContainer";
import Image from "next/image";
import Link from "next/link";
import {
	getLatestEvent,
	getPreviousEvents,
	formatEventDate,
} from "@/lib/utils/eventUtils";

export default function Page() {
	// Get sorted events (latest first)
	const latestEvent = getLatestEvent(eventsData);
	const previousEvents = getPreviousEvents(eventsData);

	// Check if registration is enabled
	const isRegistrationEnabled =
		process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "yes" ||
		process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "true";

	return (
		<PageContainer>
			{latestEvent && (
				<motion.div
					className="mb-16 w-full"
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<div className="mb-8 px-4 md:px-0">
						<h2 className="font-iceland mb-2 text-5xl font-bold text-white">
							Latest Event
						</h2>
						<div className="bg-accent h-1 w-20 rounded-full"></div>
					</div>

					<div className="grid w-full grid-cols-1 gap-8 md:grid-cols-6 md:gap-12">
						<div className="px-4 md:col-span-4 md:px-0">
							<h1 className="font-iceland mb-2 text-4xl font-bold text-white sm:text-6xl">
								{latestEvent.title}
							</h1>
							<p className="mb-6 text-lg text-neutral-300 sm:text-xl">
								{formatEventDate(latestEvent.date)}
							</p>
							<p className="text-md mb-8 font-sans leading-relaxed text-neutral-100 sm:text-lg">
								{latestEvent.description}
							</p>

							{isRegistrationEnabled && (
								<div className="flex flex-col gap-4 sm:flex-row">
									<Link
										href={`/events/${latestEvent.slug}/register`}
										className="bg-accent hover:bg-accent/90 focus:ring-accent inline-flex items-center justify-center rounded-3xl px-6 py-3 text-center font-medium text-black transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
									>
										Register for Event
									</Link>
									<Link
										href={`/events/${latestEvent.slug}`}
										className="inline-flex items-center justify-center rounded-3xl border border-neutral-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
									>
										View Details
									</Link>
								</div>
							)}

							{!isRegistrationEnabled && (
								<Link
									href={`/events/${latestEvent.slug}`}
									className="bg-accent hover:bg-accent/90 focus:ring-accent inline-flex items-center justify-center rounded-3xl px-6 py-3 text-center font-medium text-black transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
								>
									View Details
								</Link>
							)}
						</div>

						<div className="relative mx-4 w-full overflow-hidden rounded-3xl bg-neutral-800 md:col-span-2 md:mx-0">
							<Image
								src={latestEvent.image}
								alt={latestEvent.title}
								width={600}
								height={800}
								className="h-auto w-full object-contain"
								priority
								sizes="(max-width: 768px) 100vw, 40vw"
							/>
						</div>
					</div>
				</motion.div>
			)}

			{previousEvents.length > 0 && (
				<motion.div
					className="w-full"
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<div className="mb-8 px-4 md:px-0">
						<h2 className="font-iceland mb-2 text-5xl font-bold text-white">
							Previous Events
						</h2>
						<div className="bg-accent h-1 w-20 rounded-full"></div>
					</div>

					<div className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-0 lg:grid-cols-3 xl:grid-cols-4">
						{previousEvents.map((event) => (
							<motion.div key={event.slug} variants={fadeInBlur}>
								<EventCard event={event} />
							</motion.div>
						))}
					</div>
				</motion.div>
			)}
		</PageContainer>
	);
}
