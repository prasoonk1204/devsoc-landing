"use client";

import { LOGO } from "@/constant/assets";
import Image from "next/image";

export default function MaintenancePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-white">
			<div className="max-w-2xl text-center">
				<div className="mb-8 flex justify-center">
					<Image
						src={LOGO}
						alt="DevSoc Logo"
						width={120}
						height={120}
						className="animate-pulse"
						unoptimized
					/>
				</div>

				<h1 className="mb-4 text-4xl font-bold md:text-6xl">
					We&apos;ll Be Back Soon!
				</h1>

				<p className="mb-8 font-sans text-lg text-zinc-300 md:text-xl">
					Our site is currently under maintenance. We&apos;re working hard to
					improve your experience.
				</p>

				<div className="mb-8 flex items-center justify-center gap-2">
					<div className="bg-accent h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
					<div className="bg-accent h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
					<div className="bg-accent h-2 w-2 animate-bounce rounded-full"></div>
				</div>

				<p className="text-sm text-zinc-400">
					Expected to be back online shortly. Thank you for your patience!
				</p>
			</div>
		</div>
	);
}
