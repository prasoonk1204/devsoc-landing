"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { fadeInBlur } from "@/lib/motionVariants";

export default function MemberCard({ member, index }) {
	return (
		<motion.div
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			transition={{ delay: index * 0.05 }}
		>
			<Link href={member.link} className="group block">
				<div className="relative mx-auto h-60 w-full max-w-[350px] overflow-hidden rounded-3xl bg-linear-to-b from-zinc-800 to-zinc-950 font-sans text-white transition-all duration-300">
					<Image
						src={member.image}
						alt={member.name}
						width={350}
						height={280}
						className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>

					<div className="absolute right-0 bottom-0 left-0 rounded-b-3xl bg-linear-to-b from-black/40 via-black/60 to-black/80 p-4 text-zinc-300 shadow-[inset_0_-4px_4px_rgba(255,255,255,0.15)] backdrop-blur-md">
						<div className="text-lg font-semibold text-white md:text-xl">
							{member.name}
						</div>
						<div className="text-sm md:text-[16px]">{member.designation}</div>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
