"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { newsletterItems } from "@/constant/newsletter";
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

export default function Newsletter() {
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
					<motion.div
						key={index}
						className="grid grid-cols-1 rounded-lg bg-neutral-800/70 transition-colors duration-300 hover:cursor-pointer sm:grid-cols-3 sm:gap-4"
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
							className="h-45 w-full rounded-t-lg object-cover object-top sm:w-100 sm:rounded-t-none sm:rounded-l-lg"
						/>
						<div className="col-span-2 flex flex-col justify-center gap-2 p-4 font-sans">
							<h2 className="text-lg font-semibold sm:text-2xl">
								{item.title}
							</h2>
							<div className="flex justify-between text-sm text-neutral-300 sm:text-lg">
								<p>By {item.author}</p>
								<p>{item.date}</p>
							</div>
						</div>
					</motion.div>
				))}
			</div>

			<motion.div
				variants={buttonVariants}
				initial="hidden"
				whileInView="visible"
				className="mx-auto"
			>
				<Link href="/events">
					<button className="bg-accent flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-xl text-black transition-all duration-300 hover:cursor-pointer hover:gap-4 hover:bg-orange-300">
						View More
						<ArrowRight className="" />{" "}
					</button>
				</Link>
			</motion.div>
		</div>
	);
}
