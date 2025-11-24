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
import { ArrowRight, Calendar } from "lucide-react";

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
		<div className="relative flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-24 pb-16 text-white sm:pt-32 sm:pb-24">
			{/* Background Elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
				<div className="absolute top-[10%] -right-[10%] h-[400px] w-[400px] rounded-full bg-blue-900/20 blur-[100px]" />
			</div>

			<div className="relative z-10 w-full max-w-7xl px-4 sm:px-6">
				<BackButton href="/events" label="Back to Events" />

				{/* Main Content Grid */}
				<div className="mt-8 grid w-full grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
					{/* LEFT SIDE (Content) */}
					<motion.div
						className="lg:col-span-7"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<h1 className="font-iceland mb-4 text-4xl font-bold tracking-wide text-white sm:text-6xl md:text-7xl">
								{event.title}
							</h1>

							<div className="mb-6 flex flex-wrap items-center gap-6 text-neutral-300">
								<div className="flex items-center gap-2">
									<Calendar className="text-accent h-5 w-5" />
									<span className="text-base font-medium sm:text-lg">
										{formatEventDate(event.date)}
									</span>
								</div>
							</div>

							<p className="mb-8 text-base leading-relaxed text-neutral-200 sm:text-lg md:max-w-2xl">
								{event.description}
							</p>

							{/* Registration Button - Only show for latest event */}
							{isLatestEvent && isRegistrationEnabled && (
								<div className="mb-10">
									<Link
										href={`/events/${event.slug}/register`}
										className="bg-accent hover:bg-accent/90 focus:ring-accent group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-lg font-semibold text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,190,122,0.3)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
									>
										Register Now
										<ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
									</Link>
								</div>
							)}
						</motion.div>

						{/* Detailed Description Section */}
						{event.detailedDescription && (
							<motion.div
								className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
								variants={fadeInBlur}
							>
								<h3 className="font-iceland text-accent mb-4 text-2xl font-bold sm:text-3xl">
									About the Event
								</h3>
								<div className="font-sans text-sm leading-relaxed whitespace-pre-line text-neutral-300 sm:text-base">
									{showFullDescription ? (
										<>
											{event.detailedDescription}
											<button
												onClick={() => setShowFullDescription(false)}
												className="text-accent hover:text-accent/80 mt-4 flex items-center gap-1 font-medium transition-colors hover:underline"
											>
												Show less
											</button>
										</>
									) : (
										<>
											{getPreviewText(event.detailedDescription)}
											<button
												onClick={() => setShowFullDescription(true)}
												className="text-accent hover:text-accent/80 mt-2 flex items-center gap-1 font-medium transition-colors hover:underline"
											>
												Read more
											</button>
										</>
									)}
								</div>
							</motion.div>
						)}
					</motion.div>

					{/* RIGHT SIDE (Image) */}
					<motion.div
						className="relative lg:col-span-5"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<div className="sticky top-32">
							<div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl">
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
								<Image
									src={event.image}
									alt={event.title}
									width={600}
									height={800}
									className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
									priority
									sizes="(max-width: 768px) 100vw, 40vw"
								/>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Event Gallery Section */}
				{event.gallery && event.gallery.length > 0 && (
					<motion.div
						className="mt-24 w-full"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<div className="mb-10 flex items-end justify-between">
							<h2 className="font-iceland text-4xl font-bold text-white sm:text-5xl">
								Event <span className="text-accent">Snaps</span>
							</h2>
						</div>

						<div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
							{event.gallery.map((photoUrl, index) => (
								<motion.div
									key={index}
									variants={fadeInBlur}
									initial="hidden"
									whileInView="visible"
									viewport={{ once: true }}
									className="break-inside-avoid"
								>
									<div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
										<Image
											src={photoUrl}
											alt={`Event snapshot ${index + 1}`}
											width={500}
											height={500}
											className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-110"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
										/>
										<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
