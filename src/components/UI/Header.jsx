"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
	Home,
	CalendarDays,
	Newspaper,
	UserSquare2,
	Brain,
} from "lucide-react";

export default function Header() {
	const [hovered, setHovered] = useState(null);
	const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
	const navRefs = useRef([]);
	const pathname = usePathname();
	const navItems = [
		{
			title: "Home",
			href: "/",
			icon: <Home size={20} />,
		},
		{
			title: "Events",
			href: "/events",
			icon: <CalendarDays size={20} />,
		},
		{
			title: "Newsletter",
			href: "/newsletter",
			icon: <Newspaper size={20} />,
		},
		{
			title: "About",
			href: "/about",
			icon: <UserSquare2 size={20} />,
		},
		{
			title: "Quiz",
			href: "https://quizora-devsoc.vercel.app/",
			icon: <Brain size={20} />,
			external: true,
		},
	];

	const isActive = (href) => {
		if (href === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(href);
	};

	const activeIndex = navItems.findIndex((item) => isActive(item.href));
	const displayIndex = hovered !== null ? hovered : activeIndex;

	const updateIndicatorPosition = () => {
		if (displayIndex !== -1 && navRefs.current[displayIndex]) {
			const element = navRefs.current[displayIndex];
			setIndicatorStyle({
				left: element.offsetLeft,
				width: element.offsetWidth,
			});
		}
	};

	useEffect(() => {
		updateIndicatorPosition();
	}, [displayIndex]);

	useEffect(() => {
		window.addEventListener("resize", updateIndicatorPosition);
		return () => window.removeEventListener("resize", updateIndicatorPosition);
	}, [displayIndex]);

	return (
		<nav className="ease fixed right-0 bottom-0 left-0 z-100 mx-auto mb-4 flex h-fit w-fit items-center justify-center rounded-4xl border border-zinc-700/90 bg-zinc-950/80 px-1 py-2 text-white shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] backdrop-blur-lg transition-all duration-300 md:top-0 md:mt-4 md:px-1 md:py-0.5">
			{displayIndex !== -1 && (
				<motion.div
					className="bg-accent absolute h-[calc(100%-10px)] w-full rounded-full md:h-[calc(100%-6px)]"
					animate={{
						left: indicatorStyle.left,
						width: indicatorStyle.width,
					}}
					transition={{
						type: "spring",
						stiffness: 350,
						damping: 30,
					}}
				/>
			)}
			{navItems.map((item, idx) => {
				const active = isActive(item.href);

				if (item.external) {
					return (
						<a
							key={item.title}
							href={item.href}
							target="_blank"
							rel="noopener noreferrer"
							ref={(el) => (navRefs.current[idx] = el)}
							onMouseEnter={() => setHovered(idx)}
							onMouseLeave={() => setHovered(null)}
							className="group relative w-full px-5 py-3 text-center text-white sm:px-6 sm:py-3.5 xl:px-8"
						>
							<p
								className={`relative flex items-center justify-center gap-2 transition-all duration-500 ease-in-out group-hover:text-black ${hovered === idx ? "text-black" : ""}`}
							>
								{item.icon}
								<span className="hidden min-[1024px]:block">{item.title}</span>
							</p>
						</a>
					);
				}

				return (
					<Link
						key={item.title}
						href={item.href}
						ref={(el) => (navRefs.current[idx] = el)}
						onMouseEnter={() => setHovered(idx)}
						onMouseLeave={() => setHovered(null)}
						className="group relative w-full px-5 py-3 text-center text-white sm:px-6 sm:py-3.5 xl:px-8"
					>
						<p
							className={`relative flex items-center justify-center gap-2 transition-all duration-500 ease-in-out group-hover:text-black ${hovered === idx || (active && hovered === null) ? "text-black" : ""}`}
						>
							{item.icon}
							<span className="hidden min-[1024px]:block">{item.title}</span>
						</p>
					</Link>
				);
			})}
		</nav>
	);
}
