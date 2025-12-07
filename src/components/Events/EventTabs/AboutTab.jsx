"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AboutTab({ event }) {
	const [showFullDescription, setShowFullDescription] = useState(false);

	const getPreviewText = (text) => {
		if (!text) return "";
		// Keep empty lines for proper markdown paragraph spacing
		const lines = text.split("\n");
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
		<div className="relative overflow-hidden rounded-b-3xl border border-white/5 bg-zinc-950/50 backdrop-blur-sm">
			<div className="p-6 text-center">
				<h3 className="font-iceland text-2xl leading-6 font-bold tracking-[0.2em] text-white uppercase sm:text-3xl">
					About the Event
				</h3>
			</div>

			<div className="relative bg-zinc-900/50 p-4 font-sans sm:p-10">
				<div className="prose prose-invert max-w-none">
					<style jsx global>{`
						.prose h2 {
							color: #fff;
							font-weight: 700;
							font-size: 1.5rem;
							margin-top: 2rem;
							margin-bottom: 1rem;
							padding-bottom: 0.5rem;
							border-bottom: 2px solid rgba(255, 255, 255, 0.1);
							letter-spacing: 0.025em;
						}
						@media (min-width: 640px) {
							.prose h2 {
								font-size: 1.75rem;
								margin-top: 2.5rem;
							}
						}
						.prose h3 {
							color: #e4e4e7;
							font-weight: 600;
							font-size: 1.125rem;
							margin-top: 1.5rem;
							margin-bottom: 0.75rem;
							letter-spacing: 0.015em;
						}
						@media (min-width: 640px) {
							.prose h3 {
								font-size: 1.35rem;
								margin-top: 1.75rem;
							}
						}
						.prose p {
							color: #d4d4d8;
							line-height: 1.7;
							margin-bottom: 1rem;
							font-size: 0.95rem;
						}
						@media (min-width: 640px) {
							.prose p {
								font-size: 1rem;
								line-height: 1.8;
								margin-bottom: 1.25rem;
							}
						}
						.prose strong {
							color: #fff;
							font-weight: 600;
						}
						.prose a {
							color: var(--accent-color, #60a5fa);
							text-decoration: none;
							transition: all 0.2s;
							border-bottom: 1px solid transparent;
						}
						.prose a:hover {
							border-bottom-color: var(--accent-color, #60a5fa);
						}
						.prose ul,
						.prose ol {
							color: #d4d4d8;
							margin-top: 1rem;
							margin-bottom: 1rem;
							padding-left: 1.5rem;
						}
						.prose li {
							margin-top: 0.5rem;
							margin-bottom: 0.5rem;
							line-height: 1.7;
						}
						.prose li::marker {
							color: var(--accent-color, #60a5fa);
						}
						.prose code {
							color: var(--accent-color, #60a5fa);
							background-color: rgba(39, 39, 42, 0.5);
							padding: 0.2rem 0.4rem;
							border-radius: 0.25rem;
							font-size: 0.9em;
							font-weight: 500;
							border: 1px solid rgba(255, 255, 255, 0.05);
						}
						.prose pre {
							background-color: rgba(39, 39, 42, 0.5);
							border: 1px solid rgba(255, 255, 255, 0.1);
							border-radius: 0.5rem;
							padding: 1rem;
							overflow-x: auto;
						}
						.prose blockquote {
							border-left: 4px solid var(--accent-color, #60a5fa);
							padding-left: 1rem;
							color: #a1a1aa;
							font-style: italic;
							background-color: rgba(39, 39, 42, 0.3);
							padding: 1rem;
							border-radius: 0.25rem;
							margin: 1.5rem 0;
						}
						.prose hr {
							border-color: rgba(255, 255, 255, 0.1);
							margin: 2rem 0;
						}
						.prose > *:first-child {
							margin-top: 0;
						}
					`}</style>

					{showFullDescription ? (
						<>
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{event.detailedDescription}
							</ReactMarkdown>
							<div className="mt-8 flex justify-center border-t border-white/10 pt-6">
								<button
									onClick={() => setShowFullDescription(false)}
									className="group bg-accent/10 border-accent/30 hover:border-accent/60 text-accent hover:shadow-accent/20 flex cursor-pointer items-center gap-2 rounded-3xl border px-4 py-2 font-medium transition-all duration-300 hover:shadow-lg"
								>
									<span>Show Less</span>
									<ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
								</button>
							</div>
						</>
					) : (
						<>
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{getPreviewText(event.detailedDescription)}
							</ReactMarkdown>

							<div className="mt-6 flex justify-center pt-4">
								<button
									onClick={() => setShowFullDescription(true)}
									className="group bg-accent/10 border-accent/30 hover:border-accent/60 text-accent hover:shadow-accent/20 flex cursor-pointer items-center gap-2 rounded-3xl border px-4 py-2 font-medium transition-all duration-300 hover:shadow-lg"
								>
									<span>Read More</span>
									<ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
