"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const itemVariants = {
	hidden: {
		opacity: 0,
		y: 50,
		scale: 0.95,
		filter: "blur(10px)",
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			duration: 0.4,
			ease: [0.25, 0.46, 0.45, 0.94],
		},
	},
	hover: {
		scale: 1.01,
		backgroundColor: "rgba(38, 38, 38, 1)",
		transition: { duration: 0.3 },
	},
};

export default function NewsletterCard({ item, index }) {
	return (
		<Link href={`/newsletter/${item.slug}`} key={index}>
			<motion.div
				className="grid grid-cols-1 rounded-3xl bg-neutral-800/70 transition-colors duration-300 hover:cursor-pointer sm:grid-cols-3 sm:gap-4"
				variants={itemVariants}
				initial="hidden"
				whileInView="visible"
				whileHover="hover"
			>
				<Image
					src={item.image}
					alt={item.title}
					width={500}
					height={800}
					className="h-45 w-full rounded-t-3xl object-cover object-top sm:w-100 sm:rounded-t-none sm:rounded-l-3xl"
				/>
				<div className="col-span-2 flex flex-col justify-center gap-2 p-4 font-sans">
					<h2 className="text-lg font-semibold sm:text-2xl">{item.title}</h2>
					<div className="flex justify-between text-sm text-neutral-300 sm:text-lg">
						<p>By {item.author}</p>
						<p>{item.date}</p>
					</div>
				</div>
			</motion.div>
		</Link>
	);
}
