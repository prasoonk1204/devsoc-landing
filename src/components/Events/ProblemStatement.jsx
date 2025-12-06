"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState, useRef, useEffect } from "react";
import {
	Target,
	AlertTriangle,
	ChevronRight,
	Brain,
	Clapperboard,
	HeartPulse,
	Leaf,
	Users,
	Sparkles,
	Clock,
	X,
	Trophy,
} from "lucide-react";
import { operationalTimeline, scoreboardMetrics } from "@/constant/timeline";

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

// Pie Chart Component
const ScoreboardPieChart = () => {
	// Calculate conic gradient segments
	let currentAngle = 0;
	const gradientSegments = scoreboardMetrics.map((metric) => {
		const start = currentAngle;
		const end = currentAngle + (metric.value / 100) * 360;
		currentAngle = end;
		return `${metric.color} ${start}deg ${end}deg`;
	});

	const conicGradient = `conic-gradient(${gradientSegments.join(", ")})`;

	return (
		<div className="flex flex-col items-center">
			<div className="relative mb-8 h-64 w-64 rounded-full shadow-2xl">
				{/* Chart */}
				<div
					className="absolute inset-0 rounded-full"
					style={{ background: conicGradient }}
				/>
				{/* Inner Circle for Donut Effect */}
				<div className="absolute inset-8 rounded-full bg-zinc-900" />
			</div>

			{/* Legend */}
			<div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
				{scoreboardMetrics.map((metric, index) => (
					<div key={index} className="flex items-start gap-2">
						<div
							className="mt-1 h-3 w-3 shrink-0 rounded-full"
							style={{ backgroundColor: metric.color }}
						/>
						<div>
							<span className="block font-bold text-zinc-200">
								{metric.label} ({metric.value}%)
							</span>
							<span className="text-zinc-500">{metric.description}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default function ProblemStatement({ challenges }) {
	const [selectedTrack, setSelectedTrack] = useState(null);
	const detailsScrollRef = useRef(null);

	// Group challenges
	const groupedChallenges = useMemo(() => {
		const groups = {};
		challenges.forEach((challenge) => {
			if (!groups[challenge.trackId]) {
				groups[challenge.trackId] = {
					id: challenge.trackId,
					trackName: challenge.trackName,
					challenges: [],
				};
			}
			groups[challenge.trackId].challenges.push(challenge);
		});
		return Object.values(groups);
	}, [challenges]);

	const slideUp = {
		hidden: { opacity: 0, y: 15 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.4, ease: "easeOut" },
		},
	};

	// Reset scroll position when track changes
	useEffect(() => {
		if (detailsScrollRef.current) {
			detailsScrollRef.current.scrollTop = 0;
		}
	}, [selectedTrack]);

	// Handle track selection
	const handleTrackSelect = (track) => {
		setSelectedTrack(track);
	};

	return (
		<section
			className="relative z-10 w-full py-16 pb-24"
			id="problem-statements"
		>
			{/* SECTION HEADER */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-10%" }}
				variants={slideUp}
				className="mb-8 px-4 text-center md:container md:mx-auto md:mb-12"
			>
				<h2 className="font-iceland text-4xl font-bold tracking-wide text-white uppercase drop-shadow-sm sm:text-5xl md:text-6xl">
					<span className="text-accent">Problem Statement</span> & Timeline
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
					Dive into the mission tracks and synchronize with the operational
					schedule. Your strategy starts here.
				</p>
			</motion.div>

			{/* UNIVERSAL CONTAINER */}
			<div className="px-4 md:container md:mx-auto">
				{/* 
					FIXED BOX LAYOUT:
					- Mobile: Stacked columns with individual scrolling
					- Desktop: Side-by-side columns with fixed height and individual scrolling
				*/}
				<div
					id="universal-scroll-box"
					className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6"
				>
					{/* COLUMN 1: SCOREBOARD / DETAILS */}
					{/* Mobile: Order 1, Natural Height. Desktop: Order None, Fixed Height */}
					<motion.div
						id="mission-briefing-panel"
						className="order-1 w-full lg:order-none lg:col-span-4"
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<div className="relative h-[600px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl backdrop-blur-md lg:h-[700px]">
							<AnimatePresence mode="wait">
								{selectedTrack ? (
									// DETAILS VIEW
									<motion.div
										key="details"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="flex h-full flex-col bg-zinc-900/80"
									>
										<div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-zinc-900/90 p-4 backdrop-blur-md">
											<h3 className="font-iceland text-accent flex items-center gap-2 text-xl font-bold tracking-wide">
												<Brain className="h-5 w-5" /> Mission Briefing
											</h3>
											<button
												onClick={() => setSelectedTrack(null)}
												className="rounded-full bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
												aria-label="Close details"
											>
												<X className="h-5 w-5" />
											</button>
										</div>
										{/* Scrollable content area with hidden scrollbar (shows on hover) */}
										<div 
											ref={detailsScrollRef}
											className="custom-scrollbar group/scroll relative flex-1 overflow-y-scroll p-4"
											style={{ overscrollBehavior: 'contain' }}
											data-lenis-prevent
										>
											{/* Scroll hint indicator */}
											<div className="pointer-events-none absolute top-0 right-0 z-10 h-12 w-full bg-gradient-to-b from-zinc-900/80 to-transparent opacity-0 transition-opacity duration-300 group-hover/scroll:opacity-100" />
											<div className="pointer-events-none absolute bottom-0 right-0 z-10 h-12 w-full bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 transition-opacity duration-300 group-hover/scroll:opacity-100" />
											
											<h4 className="font-iceland mb-6 text-2xl leading-tight font-bold text-white">
												{selectedTrack.trackName}
											</h4>
											<div className="space-y-6 pb-4">
												{selectedTrack.challenges.map((challenge, idx) => (
													<div
														key={idx}
														className="relative rounded-xl border border-white/5 bg-white/[0.02] p-5 shadow-sm transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-md"
													>
														<div className="mb-3 flex items-start justify-between gap-4">
															<h5 className="text-lg leading-snug font-bold text-white">
																{challenge.name}
															</h5>
															<span className="shrink-0 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
																#{challenge.challengeNumber}
															</span>
														</div>
														<div className="space-y-3 text-sm text-zinc-300">
															<div>
																<strong className="mb-0.5 block text-xs tracking-wider text-zinc-500 uppercase">
																	Problem
																</strong>
																<p className="leading-relaxed text-zinc-300">
																	{challenge.problemStatement}
																</p>
															</div>
															<div>
																<strong className="mb-0.5 block text-xs tracking-wider text-zinc-500 uppercase">
																	Deliverable
																</strong>
																<p className="leading-relaxed text-zinc-300">
																	{challenge.keyDeliverable}
																</p>
															</div>
															<div className="mt-2 rounded-lg border border-red-500/10 bg-red-500/5 p-3">
																<strong className="mb-1 flex items-center gap-1.5 text-xs tracking-wider text-red-300 uppercase">
																	<AlertTriangle className="h-3 w-3" />{" "}
																	Constraint
																</strong>
																<p className="text-xs leading-relaxed text-zinc-300 italic">
																	{challenge.constraint}
																</p>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</motion.div>
								) : (
									// SCOREBOARD VIEW
									<motion.div
										key="scoreboard"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="flex h-full min-h-[450px] flex-col p-6 lg:min-h-0"
									>
										<div className="mb-6 text-center">
											<h3 className="font-iceland text-3xl font-bold tracking-widest text-white uppercase">
												The Scoreboard
											</h3>
											<p className="mt-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">
												Evaluation Standards
											</p>
										</div>
										<div className="flex flex-1 items-center justify-center">
											<ScoreboardPieChart />
										</div>
										<div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left">
											<h4 className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wide text-white uppercase">
												<Trophy className="text-accent h-3 w-3" /> Fair Play
												Rules
											</h4>
											<ul className="space-y-2 text-xs text-zinc-400">
												<li className="flex items-start gap-2">
													<div className="mt-1 h-1 w-1 rounded-full bg-zinc-500" />
													<span>
														<strong>Code Fresh:</strong> Build from scratch.
														Libraries ok.
													</span>
												</li>
												<li className="flex items-start gap-2">
													<div className="mt-1 h-1 w-1 rounded-full bg-zinc-500" />
													<span>
														<strong>Respect:</strong> No sabotage or plagiarism.
													</span>
												</li>
											</ul>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					{/* COLUMN 2: MISSIONS (TRACK SELECTION) */}
					{/* Mobile: Order 2. Desktop: Order None */}
					<motion.div
						className="order-2 w-full lg:order-none lg:col-span-4"
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<div className="flex h-[600px] flex-col lg:h-[700px]">
							<div className="mb-6 text-center lg:bg-transparent">
								<h3 className="font-iceland text-4xl leading-none font-bold tracking-widest text-white uppercase">
									The <span className="text-accent">Byte</span>
									<br />
									Battlefield
								</h3>
								<p className="mt-2 inline-block border-y border-white/5 px-4 py-1 font-mono text-xs tracking-widest text-zinc-500 uppercase">
									Select Your Mission
								</p>
							</div>

							{/* Scrollable track list */}
							<div 
								className="custom-scrollbar flex-1 overflow-y-scroll px-1 pb-2"
								style={{ overscrollBehavior: 'contain' }}
								data-lenis-prevent
							>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-col">
									{groupedChallenges.map((track, idx) => {
										const Icon = getTrackIcon(track.id);
										const isSelected = selectedTrack?.id === track.id;

										return (
											<button
												key={idx}
												onClick={() => handleTrackSelect(track)}
												className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
													isSelected
														? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(255,190,122,0.15)] scale-[1.02]"
														: "border-white/5 bg-zinc-900/40 hover:border-white/20 hover:bg-zinc-800/60 hover:scale-[1.01] active:scale-[0.99]"
												}`}
											>
												<div
													className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
														isSelected
															? "bg-accent text-black"
															: "bg-white/5 text-zinc-500 group-hover:text-white"
													}`}
												>
													<Icon className="h-5 w-5" />
												</div>
												<div className="relative z-10 min-w-0 flex-1">
													{/* <div className="mb-0.5 flex items-center gap-2">
														<span className="font-mono text-[10px] font-bold tracking-wider text-zinc-600 uppercase">
															SEQ-{String(idx + 1).padStart(2, "0")}
														</span>
													</div> */}
													<span
														className={`block truncate text-sm leading-tight font-bold transition-colors ${
															isSelected
																? "text-white"
																: "text-zinc-400 group-hover:text-white"
														}`}
													>
														{track.trackName.replace(/Track \d+: /, "")}
													</span>
												</div>
												<ChevronRight
													className={`relative z-10 h-4 w-4 shrink-0 transition-transform ${
														isSelected
															? "text-accent translate-x-1"
															: "text-zinc-700"
													}`}
												/>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</motion.div>

					{/* COLUMN 3: TIMELINE */}
					{/* Mobile: Order 3. Desktop: Order None */}
					<motion.div
						className="order-3 w-full lg:order-none lg:col-span-4"
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<div className="flex h-[600px] flex-col rounded-2xl border border-white/10 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-md lg:h-[700px]">
							<div className="mb-6 text-center">
								<h3 className="font-iceland text-2xl font-bold tracking-[0.2em] text-white uppercase">
									Operational
									<br />
									<span className="text-xl tracking-[0.1em] text-zinc-500">
										Timeline
									</span>
								</h3>
							</div>

							<div 
								className="custom-scrollbar relative flex-1 overflow-y-scroll px-2 pb-2"
								style={{ overscrollBehavior: 'contain' }}
								data-lenis-prevent
							>
								{/* Timeline Line - positioned relative to the content */}
								<div className="absolute top-0 bottom-0 left-[21px] w-px bg-white/10" />

								<div className="relative space-y-6 pt-2 pb-4">
									{operationalTimeline.map((item, index) => (
										<div key={index} className="group relative flex gap-4 pl-12 transition-all duration-200 hover:translate-x-1">
											{/* Indicator - now positioned relative to parent */}
											<div className="absolute top-0 left-0 z-10">
												<div className="group-hover:border-accent/40 group-hover:scale-110 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 shadow-md transition-all duration-300">
													<Clock className="group-hover:text-accent h-4 w-4 text-zinc-600 transition-colors duration-300" />
												</div>
											</div>

											<div className="flex-1 min-w-0">
												<span className="text-accent/90 group-hover:text-accent mb-1 block font-mono text-base font-bold transition-colors duration-200">
													{item.time}
												</span>
												<h4 className="font-iceland text-lg font-bold tracking-wide text-white uppercase transition-colors duration-200 group-hover:text-accent/90">
													{item.title}
												</h4>
												<p className="mt-1 text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
													{item.description}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
