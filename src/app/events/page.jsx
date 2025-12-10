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
import { env } from "@/lib/env";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/UI/SectionHeader";
import Button from "@/components/UI/Button";
import AnimatedContainer from "@/components/UI/AnimatedContainer";

export default function Page() {
	// Get sorted events (latest first)
	const latestEvent = getLatestEvent(eventsData);
	const previousEvents = getPreviousEvents(eventsData);

	// Check if registration is enabled
	const isRegistrationEnabled =
		env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "yes" ||
		env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "true";

	// Check if external registration URL is provided
	const externalRegistrationUrl =
		env.NEXT_PUBLIC_EXTERNAL_REGISTRATION_URL?.trim() || "";
	const useExternalRegistration =
		externalRegistrationUrl.length > 0 &&
		(externalRegistrationUrl.startsWith("http://") ||
			externalRegistrationUrl.startsWith("https://"));

	return (
		<PageContainer>
			{latestEvent && (
				<AnimatedContainer className="mb-16 w-full">
					<SectionHeader
						title="Latest Event"
						size="5xl"
						center={false}
						className="mb-8"
					/>
					<div className="bg-accent mb-8 h-1 w-20 rounded-full"></div>

					<div className="grid w-full grid-cols-1 gap-8 md:grid-cols-6 md:gap-12">
						<div className="px-4 md:col-span-4 md:px-0">
							<h1 className="font-iceland mb-2 text-4xl font-bold text-white sm:text-6xl">
								{latestEvent.title}
							</h1>
							<p className="mb-6 text-lg text-zinc-300 sm:text-xl">
								{formatEventDate(latestEvent.date)}
							</p>
							<p className="text-md mb-8 font-sans leading-relaxed text-zinc-100 sm:text-lg">
								{latestEvent.description}
							</p>

							{isRegistrationEnabled && (
								<div className="flex flex-col gap-4 sm:flex-row">
									{useExternalRegistration ? (
										<Button
											href={externalRegistrationUrl}
											variant="accent"
											size="lg"
											icon={<ArrowRight />}
											className="font-sans"
											target="_blank"
											rel="noopener noreferrer"
										>
											Register Now
										</Button>
									) : (
										<Button
											href={`/events/${latestEvent.slug}/register`}
											variant="accent"
											size="lg"
											icon={<ArrowRight />}
											className="font-sans"
										>
											Register Now
										</Button>
									)}
									<Button
										href={`/events/${latestEvent.slug}`}
										variant="secondary"
										size="lg"
										className="font-sans"
									>
										View Details
									</Button>
								</div>
							)}

							{!isRegistrationEnabled && (
								<Button
									href={`/events/${latestEvent.slug}`}
									variant="accent"
									size="lg"
									className="font-sans"
								>
									View Details
								</Button>
							)}
						</div>

						<div className="relative w-full md:col-span-2">
							<Image
								src={latestEvent.image}
								alt={latestEvent.title}
								width={600}
								height={800}
								className="h-auto w-full rounded-3xl"
								priority
								sizes="(max-width: 768px) 100vw, 40vw"
							/>
						</div>
					</div>
				</AnimatedContainer>
			)}

			{previousEvents.length > 0 && (
				<AnimatedContainer className="w-full" stagger>
					<SectionHeader
						title="Previous Events"
						size="5xl"
						center={false}
						className="mb-8"
					/>
					<div className="bg-accent mb-8 h-1 w-20 rounded-full"></div>

					<div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:px-0 lg:grid-cols-4">
						{previousEvents.map((event) => (
							<motion.div key={event.slug} variants={fadeInBlur}>
								<EventCard event={event} />
							</motion.div>
						))}
					</div>
				</AnimatedContainer>
			)}
		</PageContainer>
	);
}
