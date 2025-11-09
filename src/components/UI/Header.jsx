"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Home, CalendarDays, Newspaper, UserSquare2 } from "lucide-react";

export default function Header() {
	const [hovered, setHovered] = useState(null);
	const navItems = [
		{
			title: "Home",
			href: "/",
			icon: <Home size={20} />,
		},
		{
			title: "About",
			href: "/about",
			icon: <UserSquare2 size={20} />,
		},
		{
			title: "Newletter",
			href: "/newsletter",
			icon: <Newspaper size={20} />,
		},
		{
			title: "Events",
			href: "/events",
			icon: <CalendarDays size={20} />,
		},
	];

	return (
		<nav className="ease fixed right-0 bottom-0 left-0 z-999 mx-auto mb-4 flex h-fit w-fit items-center justify-center rounded-4xl border border-black/20 bg-neutral-900 px-1 py-0.5 text-white shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] backdrop-blur-lg transition-all duration-300 md:top-0 md:mt-4">
			{navItems.map((item, idx) => (
				<Link
					key={item.title}
					href={item.href}
					onMouseEnter={() => setHovered(idx)}
					onMouseLeave={() => setHovered(null)}
					className="group relative w-full px-6 py-3 text-center text-white lg:px-8"
				>
					{hovered === idx && (
						<motion.div
							transition={{
								ease: "easeInOut",
							}}
							layoutId="hover"
							className="absolute inset-0 h-full w-full rounded-full bg-orange-200"
						></motion.div>
					)}

					<p className="relative flex items-center justify-center gap-2 transition-all duration-500 ease-in-out group-hover:text-black">
						{item.icon}
						<span className="hidden sm:block">{item.title}</span>
					</p>
				</Link>
			))}
		</nav>
	);
}
