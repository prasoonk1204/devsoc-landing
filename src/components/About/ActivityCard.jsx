"use client";

import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";

export default function ActivityCard({ activity, index }) {
	const Icon = activity.icon;

	return (
		<motion.div
            key={index}
            variants={fadeInBlur}
            className="hover:border-accent-dark/80 group cursor-pointer rounded-3xl border border-accent/20 hover:border-accent/40 bg-neutral-900/70 p-8 text-left transition-all duration-300 hover:-translate-y-1.5 text-neutral-200"
        >
            <div className="mb-4 flex items-start">
                <motion.div
                    className="bg-accent-dark/10 text-accent-dark group-hover:bg-accent-dark/30 rounded-full p-3 transition-colors duration-150"
                >
                    <Icon className="h-6 w-6 transition-all duration-300 group-hover:text-orange-300 group-hover:rotate-360" />
                </motion.div>
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">
                    {activity.title}
                </h3>
            </div>
        </motion.div>
	);
}
