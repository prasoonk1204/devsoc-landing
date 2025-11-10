"use client";

import NewsletterCard from "@/components/Newsletter/NewsletterCard";
import { newsletterItems } from "@/constant/newsletter";
import { motion } from "motion/react";

const variants = {
	hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

export default function Page() {
	return (
		<div className="min-h-screen w-full bg-black text-white">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8 md:py-24">
				<div className="mb-12 w-full text-center">
					<motion.h1
						className="font-iceland mb-1 text-6xl font-bold"
						variants={variants}
						initial="hidden"
						animate="visible"
					>
						Newsletter
					</motion.h1>
					<motion.p
						className="text-xl text-neutral-200"
						variants={variants}
						initial="hidden"
						animate="visible"
					>
						Stay updated with the latest innovations and insights from our tech
						community
					</motion.p>
				</div>
				<div className="flex flex-col gap-8">
					{newsletterItems.map((item, index) => (
						<NewsletterCard key={index} item={item} index={index} />
					))}
				</div>
			</div>
		</div>
	);
}
