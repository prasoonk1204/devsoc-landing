"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { newsletterItems } from "@/constant/newsletter";
import Link from "next/link";
import NewsletterCard from "@/components/Newsletter/NewsletterCard";

const headerVariants = {
	hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.3, ease: "easeOut" },
	},
};

const buttonVariants = {
	hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.3, ease: "easeOut" },
	},
};

export default function Newsletter({ showViewMoreButton = true }) {
	return (
		<div className="z-2 flex w-full flex-col items-start justify-center gap-8 bg-black p-4 pt-12 pb-16 text-white sm:pb-24">
			<motion.h1
				className="font-iceland mx-auto w-full max-w-6xl text-6xl"
				variants={headerVariants}
				initial="hidden"
				whileInView="visible"
			>
				Newsletter
			</motion.h1>

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				{newsletterItems.map((item, index) => (
					<NewsletterCard key={index} item={item} index={index} />
				))}
			</div>

			{showViewMoreButton && (
				<motion.div
					variants={buttonVariants}
					initial="hidden"
					whileInView="visible"
					className="mx-auto"
				>
					<Link href="/newsletter">
						<button className="bg-accent flex items-center justify-center gap-1 rounded-3xl px-6 py-2.5 text-xl text-black transition-all duration-300 hover:cursor-pointer hover:gap-4 hover:bg-orange-300">
							View More
							<ArrowRight className="" />{" "}
						</button>
					</Link>
				</motion.div>
			)}
		</div>
	);
}