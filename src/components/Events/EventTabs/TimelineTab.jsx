"use client";

import { Clock } from "lucide-react";

export default function TimelineTab({ timeline }) {
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
							className="group relative flex gap-6 pl-12 transition-all duration-200"
						>
							<div className="absolute top-0 -left-1 z-10">
								<div className="group-hover:border-accent/60 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_10px_rgba(255,190,122,0.2)]">
									<Clock className="group-hover:text-accent h-4 w-4 text-zinc-600 transition-colors duration-300" />
								</div>
							</div>

							<div className="min-w-0 flex-1 pt-1">
								<span className="text-accent mb-1 block text-sm font-bold tracking-wider">
									{item.time}
								</span>
								<h4 className="text-lg font-bold tracking-wide text-white uppercase transition-colors duration-200 group-hover:text-white/90">
									{item.title}
								</h4>
								<p className="font-sans text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300">
									{item.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
