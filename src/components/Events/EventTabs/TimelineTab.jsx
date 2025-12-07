"use client";

import { useState } from "react";
import { Clock, ChevronDown, Calendar } from "lucide-react";

export default function TimelineTab({ timeline }) {
	const [expandedItems, setExpandedItems] = useState(new Set());

	const toggleItem = (index) => {
		setExpandedItems((prev) => {
			const newExpanded = new Set(prev);
			if (newExpanded.has(index)) {
				newExpanded.delete(index);
			} else {
				newExpanded.add(index);
			}
			return newExpanded;
		});
	};

	const formatDate = (dateStr) => {
		const [day, month, year] = dateStr.split("-");
		const date = new Date(year, month - 1, day);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="relative overflow-hidden rounded-b-3xl bg-zinc-950/50">
			<div className="p-6 text-center">
				<h3 className="font-iceland text-2xl leading-6 font-bold tracking-[0.2em] text-white uppercase sm:text-3xl">
					Operational Timeline
				</h3>
			</div>

			<div className="relative bg-zinc-900/50 p-4 md:p-6">
				<div className="absolute top-0 bottom-0 left-[30px] w-px bg-white/10 md:left-10" />

				<div className="relative space-y-8 pt-2">
					{timeline.map((item, index) => (
						<div
							key={index}
							className="group relative transition-all duration-200"
						>
							{/* Main Timeline Item */}
							<div className="relative flex gap-6 pl-12">
								<div className="absolute top-0 -left-1 z-10">
									<div className="group-hover:border-accent/60 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_10px_rgba(255,190,122,0.2)]">
										<Clock className="group-hover:text-accent h-4 w-4 text-zinc-600 transition-colors duration-300" />
									</div>
								</div>

								<div className="min-w-0 flex-1 pt-1">
									<div className="mb-1 flex flex-wrap items-center gap-2">
										<span className="text-accent block text-sm font-bold tracking-wider">
											{item.time}
										</span>
										{item.date && (
											<span className="flex items-center gap-1 text-xs text-zinc-500">
												<Calendar className="h-3 w-3" />
												{formatDate(item.date)}
											</span>
										)}
									</div>
									<h4 className="text-lg font-bold tracking-wide text-white uppercase transition-colors duration-200 group-hover:text-white/90">
										{item.title}
									</h4>
									<p className="font-sans text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
										{item.description}
									</p>

									{/* View Details Button */}
									{item.subEvents && item.subEvents.length > 0 && (
										<button
											onClick={() => toggleItem(index)}
											className="text-accent hover:text-accent/80 mt-3 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
										>
											<span>
												{expandedItems.has(index)
													? "Hide Details"
													: "View Details"}
											</span>
											<ChevronDown
												className={`h-4 w-4 transition-transform duration-300 ${
													expandedItems.has(index) ? "rotate-180" : ""
												}`}
											/>
										</button>
									)}
								</div>
							</div>

							{/* Sub Events - Expandable */}
							{item.subEvents && item.subEvents.length > 0 && (
								<div
									className={`overflow-hidden transition-all duration-300 ${
										expandedItems.has(index)
											? "mt-4 max-h-[2000px] opacity-100"
											: "max-h-0 opacity-0"
									}`}
								>
									<div className="ml-12 rounded-xl border border-white/5 bg-zinc-950/30 p-4">
										<div className="space-y-4">
											{item.subEvents.map((subEvent, subIndex) => (
												<div
													key={subIndex}
													className="border-accent/30 hover:border-accent/60 flex gap-4 border-l-2 pl-4 transition-all duration-200"
												>
													<div className="min-w-0 flex-1">
														<span className="text-accent mb-1 block text-xs font-bold tracking-wider">
															{subEvent.time}
														</span>
														<h5 className="mb-1 text-sm font-semibold text-white">
															{subEvent.title}
														</h5>
														<p className="font-sans text-xs leading-relaxed text-zinc-500">
															{subEvent.description}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
