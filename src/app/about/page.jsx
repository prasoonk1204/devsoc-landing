"use client";

import { motion } from "motion/react";
import { Code, GraduationCap, Users, Globe } from "lucide-react";
import {
	coreCommittee,
	techTeam,
	designTeam,
	managementTeam,
	teacherCoordinators,
} from "@/constant/members";
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
					<p className="mx-auto max-w-4xl text-lg leading-relaxed text-zinc-300">
						DevSoc at Asansol Engineering College is where tech feels fun and
						creative. We bring coders, designers, and thinkers into one space
						where ideas turn into real work. The aim is simple, help each other
						grow, make cool projects, and keep the energy open for anyone who
						wants to learn and try something new. If you want a space that
						sparks your drive to create, this is the place.
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
					<motion.ul className="space-y-4 text-zinc-300">
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
					className="mb-6"
				>
					<h2 className="text-4xl font-bold text-orange-300 md:text-5xl">
						Meet The Team
					</h2>
				</motion.div>

				{/* <div className="mb-16">
					<motion.h3
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className="mb-6 text-2xl font-bold text-white md:text-3xl"
					>
						Teacher Coordinators
					</motion.h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{teacherCoordinators.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} priority={index < 5} />
						))}
					</div>
				</div> */}

				<div className="mb-16">
					<motion.h3
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className="mb-6 text-2xl font-bold text-white md:text-3xl"
					>
						Core Committee
					</motion.h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{coreCommittee.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</div>

				<div className="mb-16">
					<motion.h3
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className="mb-6 text-2xl font-bold text-white md:text-3xl"
					>
						Management Team
					</motion.h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{managementTeam.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</div>

				<div className="mb-16">
					<motion.h3
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className="mb-6 text-2xl font-bold text-white md:text-3xl"
					>
						Tech Team
					</motion.h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{techTeam.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</div>

				<div className="mb-16">
					<motion.h3
						variants={fadeInBlur}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className="mb-6 text-2xl font-bold text-white md:text-3xl"
					>
						Design Team
					</motion.h3>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{designTeam.map((member, index) => (
							<MemberCard key={member.id} member={member} index={index} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
