"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	Brain,
	Clapperboard,
	HeartPulse,
	Leaf,
	Users,
	Sparkles,
	AlertTriangle,
	ChevronRight,
	ChevronDown,
	Target,
} from "lucide-react";
import ScrollableSection from "./ScrollableSection";

// Helper to get icon for track
const getTrackIcon = (trackId) => {
	if (trackId.includes("track-1")) return Brain;
	if (trackId.includes("track-2")) return Clapperboard;
	if (trackId.includes("track-3")) return HeartPulse;
	if (trackId.includes("track-4")) return Leaf;
	if (trackId.includes("track-5")) return Users;
	if (trackId.includes("track-6")) return Sparkles;
	return Target;
};

export default function TracksTab({ challenges }) {
	const [selectedTrack, setSelectedTrack] = useState(null);
	const [openAccordionId, setOpenAccordionId] = useState(null);
	const accordionRefs = useRef({});

	// Group challenges by track
	const groupedChallenges = challenges.reduce((groups, challenge) => {
		if (!groups[challenge.trackId]) {
			groups[challenge.trackId] = {
				id: challenge.trackId,
				trackName: challenge.trackName,
				challenges: [],
			};
		}
		groups[challenge.trackId].challenges.push(challenge);
		return groups;
	}, {});

	const tracks = Object.values(groupedChallenges);

	// Set first track as default for desktop only
	if (!selectedTrack && tracks.length > 0) {
		setSelectedTrack(tracks[0]);
	}

	// Scroll to accordion when it opens
	useEffect(() => {
		if (openAccordionId && accordionRefs.current[openAccordionId]) {
			// Wait for the accordion animation to complete
			const timer = setTimeout(() => {
				const element = accordionRefs.current[openAccordionId];
				if (element) {
					// Calculate position with offset for sticky tabs
					const elementPosition = element.getBoundingClientRect().top;
					const offsetPosition = elementPosition + window.pageYOffset - 60; // 80px offset for sticky tabs

					window.scrollTo({
						top: offsetPosition,
						behavior: "smooth",
					});
				}
			}, 300);

			return () => clearTimeout(timer);
		}
	}, [openAccordionId]);

	const toggleAccordion = (trackId) => {
		// If clicking the same track, close it. Otherwise, open the new one
		setOpenAccordionId(openAccordionId === trackId ? null : trackId);
	};

	return (
		<>
			{/* Mobile Accordion View */}
			<div className="block md:hidden">
				<div className="rounded-b-3xl bg-zinc-950/50">
					{/* Header */}
					<div className="border-b border-white/10 p-6 text-center backdrop-blur-sm">
						<h3 className="font-iceland text-2xl leading-6 font-bold tracking-widest text-white uppercase">
							The <span className="text-accent">Byte</span> Battlefield
						</h3>
						<p className="mt-2 font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase">
							Select Your Mission Track
						</p>
					</div>

					{/* Accordion Items */}
					<div className="divide-y divide-white/5">
						{tracks.map((track, idx) => {
							const Icon = getTrackIcon(track.id);
							const isOpen = openAccordionId === track.id;

							return (
								<div
									key={idx}
									className="border-white/5"
									ref={(el) => (accordionRefs.current[track.id] = el)}
								>
									{/* Accordion Header */}
									<button
										onClick={() => toggleAccordion(track.id)}
										className="group flex w-full items-center gap-4 px-6 py-5 text-left transition-all duration-300 hover:bg-white/3"
									>
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-all duration-300 group-hover:bg-white/10">
											<Icon className="h-5 w-5 text-zinc-400 transition-colors duration-300 group-hover:text-white" />
										</div>
										<div className="min-w-0 flex-1">
											<span className="block font-bold text-zinc-300 transition-colors duration-300 group-hover:text-white">
												{track.trackName.replace(/Track \d+: /, "")}
											</span>
										</div>
										<ChevronDown
											className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${
												isOpen ? "rotate-180" : ""
											}`}
										/>
									</button>

									{/* Accordion Content */}
									<AnimatePresence initial={false} mode="wait">
										{isOpen && (
											<motion.div
												key={track.id}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.3, ease: "easeInOut" }}
												className="overflow-hidden"
											>
												<div className="bg-selected space-y-2 p-2 md:p-6">
													{track.challenges.map((challenge, idx) => (
														<div
															key={idx}
															className="relative rounded-2xl border border-white/5 bg-zinc-950/60 p-5 shadow-lg"
														>
															<div className="mb-4 flex items-start justify-between gap-4">
																<h5 className="text-lg leading-tight font-bold text-white">
																	{challenge.name}
																</h5>
																<span className="shrink-0 rounded bg-white/5 px-2.5 py-1 font-mono text-xs font-medium text-zinc-400">
																	#{challenge.challengeNumber}
																</span>
															</div>
															<div className="space-y-4 text-[15px]">
																<div>
																	<strong className="mb-2 block font-bold tracking-wider text-zinc-500 uppercase">
																		Problem
																	</strong>
																	<p className="font-sans leading-relaxed text-zinc-300">
																		{challenge.problemStatement}
																	</p>
																</div>
																<div>
																	<strong className="mb-2 block font-bold tracking-wider text-zinc-500 uppercase">
																		Deliverable
																	</strong>
																	<p className="font-sans leading-relaxed text-zinc-300">
																		{challenge.keyDeliverable}
																	</p>
																</div>
																<div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
																	<strong className="mb-2 flex items-center gap-2 text-sm font-bold tracking-wider text-red-400 uppercase">
																		<AlertTriangle className="h-3.5 w-3.5" />
																		Constraint
																	</strong>
																	<p className="font-sans text-sm leading-relaxed text-zinc-300/90">
																		{challenge.constraint}
																	</p>
																</div>
															</div>
														</div>
													))}
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Desktop Split View */}
			<div className="hidden h-[700px] flex-col overflow-hidden rounded-b-3xl bg-zinc-950/50 md:flex">
				{/* Header */}
				<div className="border-b border-white/10 p-6 text-center backdrop-blur-sm">
					<h3 className="font-iceland text-3xl font-bold tracking-widest text-white uppercase">
						The <span className="text-accent">Byte</span> Battlefield
					</h3>
					<p className="mt-2 font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase">
						Select Your Mission Track
					</p>
				</div>

				{/* Content area */}
				<div className="flex flex-1 overflow-hidden">
					{/* LEFT: Track Names List - 1 column */}
					<div className="relative flex w-full flex-col overflow-y-auto bg-zinc-900/10 md:w-4/12 lg:w-1/3">
						<div className="space-y-1 pb-8">
							{tracks.map((track, idx) => {
								const Icon = getTrackIcon(track.id);
								const isSelected = selectedTrack?.id === track.id;

								return (
									<button
										key={idx}
										onClick={() => setSelectedTrack(track)}
										className={`group relative flex w-full items-center gap-4 px-6 py-5 text-left transition-all duration-300 ${
											isSelected
												? "bg-selected z-10 -mr-px border-y border-l border-white/10 border-r-transparent shadow-[-10px_0_20px_rgba(0,0,0,0.2)]"
												: "border-y border-transparent hover:bg-white/3"
										}`}
									>
										{isSelected && (
											<div className="bg-accent absolute inset-y-0 left-0 w-1 shadow-[0_0_10px_rgba(255,190,122,0.5)]" />
										)}

										<div
											className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
												isSelected
													? "bg-accent text-black shadow-[0_0_10px_rgba(255,190,122,0.4)]"
													: "bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-white"
											}`}
										>
											<Icon className="h-5 w-5" />
										</div>
										<div className="min-w-0 flex-1">
											<span
												className={`block font-bold transition-colors duration-300 ${
													isSelected
														? "text-white"
														: "text-zinc-400 group-hover:text-white"
												}`}
											>
												{track.trackName.replace(/Track \d+: /, "")}
											</span>
										</div>

										{!isSelected && (
											<ChevronRight className="h-4 w-4 text-zinc-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* RIGHT: Track Details - 2 columns */}
					<div className="bg-selected relative flex w-full flex-col border-l border-white/10 md:w-8/12 lg:w-2/3">
						<AnimatePresence mode="wait">
							{selectedTrack && (
								<motion.div
									key={selectedTrack.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="flex h-full flex-col"
								>
									<div className="bg-selected border-b border-white/5 px-8 py-6 backdrop-blur-sm">
										<h4 className="font-iceland text-2xl font-bold text-white">
											{selectedTrack.trackName}
										</h4>
									</div>

									<ScrollableSection className="flex-1" contentClassName="p-6">
										<div className="space-y-6 pb-6">
											{selectedTrack.challenges.map((challenge, idx) => (
												<div
													key={idx}
													className="relative rounded-2xl border border-white/5 bg-zinc-950/60 p-6 shadow-lg transition-all duration-200 hover:border-white/10 hover:shadow-xl"
												>
													<div className="mb-4 flex items-start justify-between gap-4">
														<h5 className="text-xl leading-tight font-bold text-white">
															{challenge.name}
														</h5>
														<span className="shrink-0 rounded bg-white/5 px-2.5 py-1 font-mono text-xs font-medium text-zinc-400">
															#{challenge.challengeNumber}
														</span>
													</div>
													<div className="space-y-6 text-[15px] tracking-wide">
														<div>
															<strong className="mb-2 block font-bold tracking-wider text-zinc-500 uppercase">
																Problem
															</strong>
															<p className="font-sans leading-relaxed text-zinc-300">
																{challenge.problemStatement}
															</p>
														</div>
														<div>
															<strong className="mb-2 block font-bold tracking-wider text-zinc-500 uppercase">
																Deliverable
															</strong>
															<p className="font-sans leading-relaxed text-zinc-300">
																{challenge.keyDeliverable}
															</p>
														</div>
														<div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
															<strong className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-red-400 uppercase">
																<AlertTriangle className="h-3.5 w-3.5" />
																Constraint
															</strong>
															<p className="font-sans text-sm leading-relaxed text-zinc-300/90">
																{challenge.constraint}
															</p>
														</div>
													</div>
												</div>
											))}
										</div>
									</ScrollableSection>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</>
	);
}
