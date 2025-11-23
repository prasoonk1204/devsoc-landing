"use client";

import { use, useState } from "react";
import { eventsData } from "@/constant/events";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import BackButton from "@/components/UI/BackButton";
import { formatEventDate, getLatestEvent } from "@/lib/utils/eventUtils";

export default function EventDetailPage({ params }) {
	const { slug } = use(params);
	const event = eventsData.find((e) => e.slug === slug);
	const [showFullDescription, setShowFullDescription] = useState(false);

	if (!event) {
		notFound();
	}

	// Check if this is the latest event
	const latestEvent = getLatestEvent(eventsData);
	const isLatestEvent = latestEvent && latestEvent.slug === event.slug;

	// Check if registration is enabled
	const isRegistrationEnabled =
		process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "yes" ||
		process.env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "true";

	const getPreviewText = (text) => {
		if (!text) return "";
		const lines = text.split("\n").filter((line) => line.trim());
		let preview = "";
		let charCount = 0;
		for (let i = 0; i < lines.length && charCount < 800; i++) {
			preview += lines[i] + "\n";
			charCount += lines[i].length;
		}
		return preview.trim();
	};

	return (
		<div className="relative flex w-full flex-col items-center justify-center bg-black p-4 pt-20 pb-16 text-white sm:p-6 sm:pt-20 sm:pb-24 md:pt-40">
			<div className="relative w-full max-w-6xl">
				<BackButton href="/events" label="All Events" />

				{/* Main Content Grid */}
				<div className="mt-6 grid w-full grid-cols-1 gap-8 md:grid-cols-6 md:gap-12">
					{/* LEFT SIDE (Content) */}
					<motion.div
						className="md:col-span-4"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<h1 className="font-iceland mb-2 text-5xl font-bold sm:text-7xl">
							{event.title}
						</h1>
						<p className="mb-6 text-lg text-neutral-300 sm:text-xl">
							{formatEventDate(event.date)}
						</p>
						<p className="text-md font-sans leading-relaxed text-neutral-100 sm:text-lg">
							{event.description}
						</p>

						{/* Registration Button - Only show for latest event */}
						{isLatestEvent && isRegistrationEnabled && (
							<div className="mt-8">
								<Link
									href={`/events/${event.slug}/register`}
									className="bg-accent hover:bg-accent/90 focus:ring-accent inline-flex items-center justify-center rounded-3xl px-6 py-3 text-center font-medium text-black transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
								>
									Register for Event
								</Link>
							</div>
						)}
					</motion.div>

					{/* RIGHT SIDE (Image) */}
					<motion.div
						className="relative w-full overflow-hidden md:col-span-2"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<Image
							src={event.image}
							alt={event.title}
							width={600}
							height={800}
							className="h-auto w-full rounded-3xl object-contain"
							priority
							sizes="(max-width: 768px) 100vw, 40vw"
						/>
					</motion.div>
				</div>

				{/* Detailed Description Section */}
				{event.detailedDescription && (
					<motion.div
						className="mt-12 w-full"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 sm:p-8">
							<div className="font-sans text-sm leading-relaxed whitespace-pre-line text-neutral-300 sm:text-base">
								{showFullDescription ? (
									<>
										{event.detailedDescription}
										<button
											onClick={() => setShowFullDescription(false)}
											className="mt-4 inline-block text-orange-300 transition-colors hover:cursor-pointer hover:text-orange-200"
										>
											...view less
										</button>
									</>
								) : (
									<>
										{getPreviewText(event.detailedDescription)}
										<button
											onClick={() => setShowFullDescription(true)}
											className="ml-1 inline-block text-orange-300 transition-colors hover:cursor-pointer hover:text-orange-200"
										>
											...view more
										</button>
									</>
								)}
							</div>
						</div>
					</motion.div>
				)}

				{/* Event Gallery Section */}
				{event.gallery && event.gallery.length > 0 && (
					<motion.div
						className="w-full pt-12"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<h2 className="font-iceland mb-6 text-5xl font-bold">
							Event Snaps
						</h2>
						<div className="columns-2 gap-4 space-y-4 md:columns-4 md:gap-6">
							{event.gallery.map((photoUrl, index) => (
								<motion.div
									key={index}
									variants={fadeInBlur}
									initial="hidden"
									whileInView="visible"
									viewport={{ once: true }}
									className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-3xl bg-neutral-800"
								>
									<Image
										src={photoUrl}
										alt={`Event snapshot ${index + 1}`}
										width={500}
										height={500}
										className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
										sizes="(max-width: 768px) 50vw, 25vw"
									/>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
