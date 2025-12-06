"use client";

import { useState } from "react";

export default function AboutTab({ event }) {
	const [showFullDescription, setShowFullDescription] = useState(false);

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

	if (!event.detailedDescription) return null;

	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50">
			<div className="p-6 text-center">
				<h3 className="font-iceland text-2xl font-bold tracking-[0.2em] text-white uppercase">
					About the Event
				</h3>
			</div>

			<div className="relative bg-zinc-900/50 p-6">
				<div className="font-sans text-sm leading-relaxed whitespace-pre-line text-zinc-300 sm:text-base">
					{showFullDescription ? (
						<>
							{event.detailedDescription}
							<button
								onClick={() => setShowFullDescription(false)}
								className="text-accent hover:text-accent/80 mt-4 flex items-center gap-1 font-medium transition-colors hover:cursor-pointer hover:underline"
							>
								Show less
							</button>
						</>
					) : (
						<>
							{getPreviewText(event.detailedDescription)}
							<button
								onClick={() => setShowFullDescription(true)}
								className="text-accent hover:text-accent/80 mt-2 flex items-center gap-1 font-medium transition-colors hover:cursor-pointer hover:underline"
							>
								Read more
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
