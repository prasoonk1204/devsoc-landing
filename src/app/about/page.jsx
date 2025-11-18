"use client";

import { motion } from "motion/react";
import { Code, GraduationCap, Users, Globe } from "lucide-react";
import { committeeMembers, subCommitteeMembers } from "@/constant/members";
import {
	fadeInBlur,
	fadeInBlurFast,
	staggerContainer,
} from "@/lib/motionVariants";
import MemberCard from "@/components/About/MemberCard";
import ActivityCard from "@/components/About/ActivityCard";

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

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-black px-4 py-8 text-white md:py-24">
			<div className="mx-auto max-w-6xl">
				<motion.div
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="mb-6 text-center"
				>
					<h1 className="font-iceland text-6xl font-bold">About Us</h1>
				</motion.div>

				<motion.div
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
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
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mb-16"
				>
					<motion.h2
						variants={fadeInBlurFast}
						className="mb-6 text-3xl font-bold text-orange-300 md:text-4xl"
					>
						Our Mission:
					</motion.h2>
					<motion.ul className="space-y-4 text-neutral-300">
						<motion.li variants={fadeInBlurFast} className="flex gap-3">
							<span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
							<span className="text-lg">
								To foster a culture of learning, building, and sharing in the
								field of software development and emerging technologies.
							</span>
						</motion.li>
						<motion.li variants={fadeInBlurFast} className="flex gap-3">
							<span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
							<span className="text-lg">
								To provide students with opportunities to explore coding,
								design, and innovation beyond the classroom.
							</span>
						</motion.li>
						<motion.li variants={fadeInBlurFast} className="flex gap-3">
							<span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-orange-300" />
							<span className="text-lg">
								To encourage collaboration and prepare members for real-world
								challenges through projects, hackathons, and workshops.
							</span>
						</motion.li>
					</motion.ul>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mb-20"
				>
					<motion.h2
						variants={fadeInBlurFast}
						className="mb-8 text-3xl font-bold text-orange-300 md:text-4xl"
					>
						What we do?
					</motion.h2>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{activities.map((activity, index) => (
							<ActivityCard key={index} activity={activity} index={index} />
						))}
					</div>
				</motion.div>

				<motion.div
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="mb-20"
				>
					<h2 className="mb-8 text-3xl font-bold text-orange-300 md:text-4xl">
						Committee Members:
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{committeeMembers.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</motion.div>

				<motion.div
					variants={fadeInBlur}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
				>
					<h2 className="mb-8 text-3xl font-bold text-orange-300 md:text-4xl">
						Sub-Committee Members:
					</h2>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{subCommitteeMembers.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
