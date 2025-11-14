"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { eventsData } from "@/constant/events";
import { Carousel, Card } from "@/components/UI/mobileCarousel";
import { fadeInBlur, fadeInBlurFast } from "@/lib/motionVariants";
import { formatEventDate } from "@/lib/utils/eventUtils";

function useMediaQuery(query) {
	const [matches, setMatches] = useState(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const media = window.matchMedia(query);
		setMatches(media.matches);
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [query]);

	return { matches, mounted };
}

export default function Events() {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const ref = useRef(null);
	const { matches: isMobile, mounted } = useMediaQuery("(max-width: 768px)");

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const globalScale = useTransform(
		scrollYProgress,
		[0, 0.5, 1],
		[0.98, 1, 0.98],
	);

	if (!mounted) {
		return (
			<section
				ref={ref}
				className="bg-accent/20 mx-auto flex w-full flex-col items-start py-16 md:py-20"
			>
				<div className="w-full px-4">
					<motion.h2
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="font-iceland mx-auto mb-12 w-full max-w-6xl text-6xl font-bold"
					>
						Events
					</motion.h2>
					<div className="h-96" />
				</div>
			</section>
		);
	}

	return (
		<section
			ref={ref}
			className="bg-accent/20 mx-auto flex w-full flex-col items-start py-16 md:py-20"
		>
			<div className="w-full">
				<motion.h2
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="font-iceland mx-auto w-full max-w-6xl px-4 text-6xl font-bold md:mb-12"
				>
					Events
				</motion.h2>

				{/* Responsive layout switch */}
				{isMobile ? (
					<AppleCardsCarouselSection />
				) : (
					<FannedLayout
						eventsData={eventsData}
						globalScale={globalScale}
						hoveredIndex={hoveredIndex}
						setHoveredIndex={setHoveredIndex}
					/>
				)}

				{!isMobile && (
					<motion.div
						variants={fadeInBlurFast}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="flex justify-center"
					>
						<Link href="/events">
							<button className="mx-auto flex items-center justify-center gap-1 rounded-3xl bg-neutral-950 px-6 py-2.5 text-xl text-white transition-all duration-300 hover:cursor-pointer hover:gap-4 hover:bg-neutral-800">
								View More
								<ArrowRight className="" />{" "}
							</button>
						</Link>
					</motion.div>
				)}
			</div>
		</section>
	);
}

function FannedLayout({
	eventsData,
	globalScale,
	hoveredIndex,
	setHoveredIndex,
}) {
	return (
		<div className="relative mb-12 flex h-80 items-center justify-center md:h-96">
			<div className="relative flex h-full w-full max-w-[850px] items-center justify-center">
				{eventsData.map((event, index) => {
					const centerIndex = (eventsData.length - 1) / 2;
					const baseTranslateX = (index - centerIndex) * 160;

					const isHovered = hoveredIndex === index;
					const isLeft = hoveredIndex !== null && index < hoveredIndex;
					const isRight = hoveredIndex !== null && index > hoveredIndex;

					let xOffset = baseTranslateX;
					if (isLeft) xOffset -= 60;
					if (isRight) xOffset += 60;

					const zIndex = isHovered ? 50 : 10 - index;
					const hoverScale = isHovered ? 1.1 : 1;
					// const hoverBlur = isHovered ? 0 : 10;

					return (
						<motion.div
							key={event.slug}
							className="absolute top-1/2 left-1/2 w-40 origin-center sm:w-48 lg:w-60"
							style={{
								translate: "-50% -50%",
								zIndex,
								scale: globalScale,
								filer: "blur(0px)",
							}}
							whileInView={{
								x: xOffset,
								rotate: isHovered ? 0 : -6 + index * 3,
								transition: {
									x: { type: "spring", stiffness: 160, damping: 18 },
									rotate: {
										type: "spring",
										stiffness: 80,
										damping: 14,
										duration: 0.5,
									},
								},
								filter: "blur(0px)",
							}}
							viewport={{ once: true }}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							<Link href={`/events/${event.slug}`} scroll>
								<motion.div
									whileHover={{ y: -10, scale: hoverScale }}
									transition={{ type: "tween", duration: 0.25 }}
									className={`group relative cursor-pointer rounded-3xl bg-neutral-600 transition-all duration-300 ease-out`}
									style={{
										filter: isHovered
											? "drop-shadow(12px 12px 12px rgba(0,0,0,0.5))"
											: "drop-shadow(8px 8px 8px rgba(0,0,0,0.5))",
									}}
								>
									<img
										src={event.image || "/placeholder.svg"}
										alt={event.title}
										className="aspect-3/4 w-full rounded-3xl object-cover transition-transform duration-300 ease-out"
									/>
									<div className="absolute inset-0 flex items-end rounded-3xl bg-linear-to-b from-transparent to-black p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
										<div>
											<h3 className="text-lg font-bold text-white">
												{event.title}
											</h3>
											<p className="text-sm text-gray-200">
												{formatEventDate(event.date)}
											</p>
										</div>
									</div>
								</motion.div>
							</Link>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}

function AppleCardsCarouselSection() {
	const limitedEvents = eventsData.slice(0, 3);

	const cards = limitedEvents.map((event, index) => {
		const cardData = {
			category: formatEventDate(event.date),
			title: event.title,
			src: event.image,
			href: `/events/${event.slug}`,
		};
		return <Card key={event.slug} card={cardData} index={index} />;
	});

	const viewMoreCard = (
		<Link href="/events" key="view-more">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
				className="relative flex h-110 w-75 cursor-pointer items-center justify-center overflow-hidden rounded-3xl bg-neutral-900 shadow-[2px_2px_5px_rgba(0,0,0,0.2),-2px_2px_5px_rgba(0,0,0,0.2),0_4px_5px_rgba(0,0,0,0.2)] md:h-160 md:w-96"
				whileHover={{ scale: 1.05 }}
			>
				<div className="flex flex-col items-center justify-center gap-4 text-white">
					<ArrowRight className="h-12 w-12" />
					<p className="text-2xl font-bold">View More</p>
					<p className="text-sm text-gray-400">See all events</p>
				</div>
			</motion.div>
		</Link>
	);

	return (
		<div className="w-full">
			<Carousel items={[...cards, viewMoreCard]} />
		</div>
	);
}
