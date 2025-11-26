"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LOGO } from "@/constant/assets";

export default function LoadingScreen({ onLoadComplete, isModelLoaded }) {
	const [shouldHide, setShouldHide] = useState(false);

	useEffect(() => {
		if (isModelLoaded) {
			setShouldHide(true);
			setTimeout(() => {
				onLoadComplete?.();
			}, 600);
		}
	}, [isModelLoaded, onLoadComplete]);

	return (
		<div
			className={`fixed inset-0 flex items-center justify-center bg-orange-100 transition-opacity duration-500 ${
				shouldHide ? "pointer-events-none opacity-0" : "opacity-100"
			}`}
			style={{ zIndex: 9999 }}
		>
			<div className="relative">
				<div className="animate-spin-slow">
					<Image
						src={LOGO}
						alt="DevSoc Logo"
						width={150}
						height={150}
						priority
						className="drop-shadow-lg"
					/>
				</div>

				<div className="animate-pulse-ring absolute inset-0 -m-4 rounded-full border-4 border-orange-300 opacity-50" />
				<div className="animate-pulse-ring-delayed absolute inset-0 -m-8 rounded-full border-4 border-orange-200 opacity-30" />
			</div>
		</div>
	);
}
