"use client";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const Carousel = ({ items }) => {
	const containerRef = useRef(null);

	return (
		<div className="relative w-full">
			<div
				className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
				ref={containerRef}
			>
				<div className="mx-auto flex max-w-7xl flex-row justify-start gap-4 pl-4">
					{items.map((item, index) => (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.5,
								delay: 0.2 * index,
								ease: "easeOut",
							}}
							key={"card" + index}
							className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
							style={{
								willChange: "transform, opacity",
								backfaceVisibility: "hidden",
								WebkitBackfaceVisibility: "hidden",
							}}
						>
							{item}
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
};

export const Card = ({ card }) => {
	return (
		<>
			<motion.div
				className="relative h-110 w-75 overflow-hidden rounded-3xl bg-zinc-900 shadow-[2px_2px_5px_rgba(0,0,0,0.2),-2px_2px_5px_rgba(0,0,0,0.2),0_4px_5px_rgba(0,0,0,0.2)] md:h-160 md:w-96"
				whileHover={{ scale: 1.05 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				style={{
					willChange: "transform",
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
					transform: "translateZ(0)",
					WebkitTransform: "translateZ(0)",
				}}
			>
				<Link href={card.href || "#"}>
					<div className="relative h-full w-full">
						<Image
							src={card.src}
							alt={card.title}
							fill
							quality={80}
							placeholder="blur"
							blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzI3MjcyNyIvPjwvc3ZnPg=="
							className="absolute inset-0 object-cover"
						/>
						<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80" />
						<div className="absolute right-0 bottom-0 left-0 p-4 md:p-8">
							<motion.p
								className="mb-2 text-sm font-medium text-white md:text-base"
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3, ease: "easeOut" }}
							>
								{card.category}
							</motion.p>
							<motion.p
								className="text-xl leading-tight font-semibold text-white md:text-3xl"
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.4, ease: "easeOut" }}
							>
								{card.title}
							</motion.p>
						</div>
					</div>
				</Link>
			</motion.div>
		</>
	);
};

export const BlurImage = ({
	height,
	width,
	src,
	className,
	alt,
	fill,
	...rest
}) => {
	const [isLoading, setLoading] = useState(true);

	return (
		<Image
			className={cn(
				"transition duration-300",
				isLoading ? "blur-sm" : "blur-0",
				className,
			)}
			onLoad={() => setLoading(false)}
			src={src}
			width={!fill ? width : undefined}
			height={!fill ? height : undefined}
			fill={fill}
			quality={80}
			placeholder="blur"
			blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzI3MjcyNyIvPjwvc3ZnPg=="
			alt={alt || "Background of a beautiful view"}
			{...rest}
		/>
	);
};
