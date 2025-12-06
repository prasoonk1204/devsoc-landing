"use client";

import { use, useState } from "react";
import { eventsData } from "@/constant/events";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import BackButton from "@/components/UI/BackButton";
import { formatEventDate, getLatestEvent } from "@/lib/utils/eventUtils";
import { env } from "@/lib/env";
import { ArrowRight, Calendar, Download, Info, Target, Clock } from "lucide-react";
import { challengesData } from "@/constant/problemStatements";
import { operationalTimeline } from "@/constant/timeline";
import AboutTab from "@/components/Events/EventTabs/AboutTab";
import TracksTab from "@/components/Events/EventTabs/TracksTab";
import TimelineTab from "@/components/Events/EventTabs/TimelineTab";

export default function EventDetailPage({ params }) {
	const { slug } = use(params);
	const event = eventsData.find((e) => e.slug === slug);

	if (!event) {
		notFound();
	}

	// Check if this is the latest event
	const latestEvent = getLatestEvent(eventsData);
	const isLatestEvent = latestEvent && latestEvent.slug === event.slug;

	// Check if registration is enabled
	const isRegistrationEnabled =
		env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "yes" ||
		env.NEXT_PUBLIC_ENABLE_EVENT_REGISTRATION === "true";

	// Check environment configurations
	const problemStatementEvents = (
		env.NEXT_PUBLIC_PROBLEM_STATEMENT_EVENTS || ""
	)
		.split(",")
		.map((s) => s.trim());
	const showProblemStatement = problemStatementEvents.includes(event.slug);

	const disableSnapsEvents = (env.NEXT_PUBLIC_DISABLE_EVENT_SNAPS || "")
		.split(",")
		.map((s) => s.trim());
	const showEventSnaps = !disableSnapsEvents.includes(event.slug);

	// Check if tabs have data
	const hasAboutData = !!event.detailedDescription;
	const hasTracksData = showProblemStatement && challengesData.length > 0;
	const hasTimelineData = showProblemStatement && operationalTimeline.length > 0;

	// Determine default tab - prioritize tracks if available, then about
	const getDefaultTab = () => {
		if (hasTracksData) return "tracks";
		if (hasAboutData) return "about";
		if (hasTimelineData) return "timeline";
		return "about";
	};

	const [activeTab, setActiveTab] = useState(getDefaultTab());

	// Check if we should show the tabbed section at all
	const showTabbedSection = hasAboutData || hasTracksData || hasTimelineData;

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center px-4 pt-24 pb-16 text-white sm:pt-36 sm:pb-24">
			<div className="relative w-full max-w-6xl">
				<BackButton href="/events" label="Back to Events" />

				{/* Main Content Grid */}
				<div className="mt-6 grid w-full grid-cols-1 gap-8 md:mt-2 lg:grid-cols-12 lg:gap-12">
					{/* LEFT SIDE (Content) */}
					<motion.div
						className="lg:col-span-8"
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

							<div className="mb-6 flex flex-wrap items-center gap-6 text-zinc-300">
								<div className="flex items-center gap-2">
									<Calendar className="text-accent h-5 w-5" />
									<span className="text-base font-medium sm:text-lg">
										{formatEventDate(event.date)}
									</span>
								</div>
							</div>

							<p className="mb-8 text-base leading-relaxed text-zinc-200 sm:text-lg md:max-w-2xl">
								{event.description}
							</p>

							{/* Registration Button - Only show for latest event */}
							{isLatestEvent && isRegistrationEnabled && (
								<Link
									href={`/events/${event.slug}/register`}
									className="bg-accent hover:bg-accent/90 focus:ring-accent group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-sans font-semibold text-black transition-all duration-300 hover:gap-4 hover:shadow-[0_0_20px_rgba(255,190,122,0.3)] focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none md:mb-6"
								>
									<span>Register Now</span>
									<ArrowRight className="h-5 w-5 transition-transform duration-300" />
								</Link>
							)}
						</motion.div>

					</motion.div>

					{/* RIGHT SIDE (Image) */}
					<motion.div
						className="relative lg:col-span-4"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						<div className="sticky top-32">
							<div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
								<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
								<Image
									src={event.image}
									alt={event.title}
									width={600}
									height={800}
									className="h-auto w-full object-cover"
									priority
									sizes="(max-width: 768px) 100vw, 40vw"
								/>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Tabbed Section - Only show if there's data */}
				{showTabbedSection && (
					<motion.div
						className="mt-12 w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/30 backdrop-blur-sm"
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						{/* Tab Navigation */}
						<div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-white/10 bg-zinc-950/50 p-2 scrollbar-hide">
							{hasTracksData && (
								<button
									onClick={() => setActiveTab("tracks")}
									className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-sans text-sm font-semibold transition-all duration-300 cursor-pointer sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
										activeTab === "tracks"
											? "bg-accent text-black shadow-lg"
											: "text-zinc-400 hover:bg-accent/20 hover:text-white"
									}`}
								>
									<Target className="h-4 w-4 sm:h-5 sm:w-5" />
									<span>Tracks</span>
								</button>
							)}

							{hasTimelineData && (
								<button
									onClick={() => setActiveTab("timeline")}
									className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-sans text-sm font-semibold transition-all duration-300 cursor-pointer sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
										activeTab === "timeline"
											? "bg-accent text-black shadow-lg"
											: "text-zinc-400 hover:bg-accent/20 hover:text-white"
									}`}
								>
									<Clock className="h-4 w-4 sm:h-5 sm:w-5" />
									<span>Timeline</span>
								</button>
							)}

							{hasAboutData && (
								<button
									onClick={() => setActiveTab("about")}
									className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-sans text-sm font-semibold transition-all duration-300 cursor-pointer sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
										activeTab === "about"
											? "bg-accent text-black shadow-lg"
											: "text-zinc-400 hover:bg-accent/20 hover:text-white"
									}`}
								>
									<Info className="h-4 w-4 sm:h-5 sm:w-5" />
									<span>About</span>
								</button>
							)}
						</div>

						{/* Tab Content */}
						<div className="">
							<AnimatePresence mode="wait">
								{activeTab === "about" && hasAboutData && (
									<motion.div
										key="about"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
									>
										<AboutTab event={event} />
									</motion.div>
								)}

								{activeTab === "tracks" && hasTracksData && (
									<motion.div
										key="tracks"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
									>
										<TracksTab challenges={challengesData} />
									</motion.div>
								)}

								{activeTab === "timeline" && hasTimelineData && (
									<motion.div
										key="timeline"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
									>
										<TimelineTab timeline={operationalTimeline} />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				)}

				{/* Event Gallery Section */}
				{showEventSnaps && event.gallery && event.gallery.length > 0 && (
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
									<div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
										<Image
											src={photoUrl}
											alt={`Event snapshot ${index + 1}`}
											width={500}
											height={500}
											className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-102"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
										/>
										<div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

										{/* Download Button */}
										<button
											onClick={async (e) => {
												e.stopPropagation();
												try {
													const response = await fetch(photoUrl);
													const blob = await response.blob();
													const blobUrl = window.URL.createObjectURL(blob);
													const link = document.createElement("a");
													link.href = blobUrl;
													link.download = `event-snap-${index + 1}.jpg`;
													document.body.appendChild(link);
													link.click();
													document.body.removeChild(link);
													window.URL.revokeObjectURL(blobUrl);
												} catch (error) {
													// console.error("Download failed:", error);
													window.open(photoUrl, "_blank");
												}
											}}
											className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-100 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:bg-black/70 lg:opacity-0 lg:group-hover:opacity-100"
											title="Download Image"
										>
											<Download className="h-5 w-5" />
										</button>
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
