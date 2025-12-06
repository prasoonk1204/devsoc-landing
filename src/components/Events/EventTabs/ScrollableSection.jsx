"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export default function ScrollableSection({
	children,
	className = "",
	contentClassName = "",
}) {
	const scrollRef = useRef(null);
	const [canScrollDown, setCanScrollDown] = useState(true);

	const checkScroll = () => {
		if (scrollRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
			setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
		}
	};

	useEffect(() => {
		checkScroll();
		window.addEventListener("resize", checkScroll);
		return () => window.removeEventListener("resize", checkScroll);
	}, [children]);

	return (
		<div className={`relative flex flex-col overflow-hidden ${className}`}>
			{/* Scrollable Content */}
			<div
				ref={scrollRef}
				onScroll={checkScroll}
				className={`custom-scrollbar flex-1 overflow-y-scroll ${contentClassName}`}
				style={{ overscrollBehavior: "contain" }}
				data-lenis-prevent
			>
				{children}
			</div>

			{/* Bottom Indicator */}
			<AnimatePresence>
				{canScrollDown && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="pointer-events-none absolute right-0 -bottom-2 left-0 z-20 flex h-24 flex-col items-center justify-end bg-linear-to-t from-zinc-950 to-transparent pb-4"
					>
						<div className="flex flex-col items-center gap-1">
							<span className="text-accent/70 font-mono text-[10px] tracking-[0.2em] uppercase">
								Scroll
							</span>
							<ChevronDown className="text-accent animate-bounce" size={20} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
