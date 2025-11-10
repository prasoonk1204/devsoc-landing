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

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

export default function Page() {
	return (
		<div className="min-h-screen w-full bg-black text-white">
			<div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-8 sm:px-6 md:py-24 lg:px-8">
				<div className="mb-12 w-full text-center">
					<motion.h1
						className="font-iceland mb-4 text-6xl font-bold"
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
						Latest updates, announcements, and stories from the
						DevSoc team.
					</motion.p>
				</div>
				
				<motion.div
					className="grid w-full grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:px-0 lg:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
				>
					{newsletterItems.map((item) => (
						<motion.div key={item.slug} variants={variants}>
							<NewsletterCard item={item} />
						</motion.div>
					))}
				</motion.div>
			</div>
		</div>
	);
}