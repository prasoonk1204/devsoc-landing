"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Code, GraduationCap, Users, Globe } from "lucide-react";
import { committeeMembers, subCommitteeMembers } from "@/constant/members";

const activities = [
	{
		icon: Code,
		title: "Hackathons & Coding Challenges",
	},
	{
		icon: GraduationCap,
		title: "Workshops & Seminars",
	},
	{
		icon: Users,
		title: "Tech Talks & Networking",
	},
	{
		icon: Globe,
		title: "Community Building",
	},
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
		},
	},
};

const cardVariants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.4,
		},
	},
};

function MemberCard({ member, index }) {
	return (
		<motion.div
			variants={cardVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			transition={{ delay: index * 0.05 }}
		>
			<Link href={member.link} className="group block">
				<div className="relative overflow-hidden rounded-2xl bg-neutral-800 p-4 transition-all duration-300 hover:scale-105 hover:bg-neutral-700">
					<div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-neutral-900">
						<Image
							src={member.image}
							alt={member.name}
							fill
							className="object-contain"
						/>
					</div>
					<div className="text-center">
						<h3 className="font-semibold text-white">{member.name}</h3>
						<p className="text-sm text-orange-300">{member.designation}</p>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-black px-4 pt-24 pb-16 text-white md:pt-32">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-12 text-center"
				>
					<h1 className="font-iceland mb-6 text-5xl font-bold md:text-6xl">
						About Us
					</h1>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="mb-16 text-center"
				>
					<p className="mx-auto max-w-4xl text-lg leading-relaxed text-neutral-300">
						At Development Society (DevSoc), Asansol Engineering College, we are
						more than just a student club; we are a thriving community of
						coders, designers, and problem-solvers. Founded with the vision of
						empowering students through technology, Devsoc serves as a hub where
						creativity meets engineering excellence.
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mb-16"
				>
					<motion.h2
						variants={itemVariants}
						className="mb-6 text-3xl font-bold text-orange-300 md:text-4xl"
					>
						Our Mission:
					</motion.h2>
					<motion.ul className="space-y-4 text-neutral-300">
						<motion.li variants={itemVariants} className="flex gap-3">
							<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
							<span className="text-lg">
								To foster a culture of learning, building, and sharing in the
								field of software development and emerging technologies.
							</span>
						</motion.li>
						<motion.li variants={itemVariants} className="flex gap-3">
							<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
							<span className="text-lg">
								To provide students with opportunities to explore coding,
								design, and innovation beyond the classroom.
							</span>
						</motion.li>
						<motion.li variants={itemVariants} className="flex gap-3">
							<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
							<span className="text-lg">
								To encourage collaboration and prepare members for real-world
								challenges through projects, hackathons, and workshops.
							</span>
						</motion.li>
					</motion.ul>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mb-20"
				>
					<motion.h2
						variants={itemVariants}
						className="mb-8 text-3xl font-bold text-orange-300 md:text-4xl"
					>
						What we do?
					</motion.h2>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{activities.map((activity, index) => (
							<motion.div
								key={index}
								variants={itemVariants}
								whileHover={{ scale: 1.05, y: -5 }}
								className="group rounded-2xl bg-neutral-900 p-6 text-center transition-all duration-300 hover:bg-neutral-800"
							>
								<div className="mb-4 flex justify-center">
									<motion.div
										className="rounded-full bg-orange-300/10 p-4"
										whileHover={{
											backgroundColor: "rgba(253, 186, 116, 0.2)",
											scale: 1.1,
										}}
										transition={{ duration: 0.3 }}
									>
										<motion.div
											whileHover={{
												rotate: [0, -10, 10, -10, 0],
												scale: [1, 1.1, 1.1, 1.1, 1],
											}}
											transition={{
												duration: 0.5,
												ease: "easeInOut",
											}}
										>
											<activity.icon className="h-8 w-8 text-orange-300 transition-colors group-hover:text-orange-200" />
										</motion.div>
									</motion.div>
								</div>
								<h3 className="text-lg font-semibold text-white">
									{activity.title}
								</h3>
							</motion.div>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.6 }}
					className="mb-20"
				>
					<h2 className="mb-8 text-3xl font-bold text-orange-300 md:text-4xl">
						Committee Members:
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{committeeMembers.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="mb-8 text-3xl font-bold text-orange-300 md:text-4xl">
						Sub-Committee Members:
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{subCommitteeMembers.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
