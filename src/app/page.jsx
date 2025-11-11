"use client";

import { useState, useEffect } from "react";
import Events from "@/components/Home/Events";
import Hero from "@/components/Home/Hero";
import Newsletter from "@/components/Home/Newsletter";
import Gallery from "@/components/Home/Gallery";
import LoadingScreen from "@/components/Home/LoadingScreen";

export default function Home() {
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	// For mobile, set model as loaded after a timeout since there's no 3D model
	useEffect(() => {
		const checkMobile = () => {
			if (typeof window !== "undefined" && window.innerWidth < 768) {
				const timer = setTimeout(() => {
					setIsModelLoaded(true);
				}, 1500);
				return () => clearTimeout(timer);
			}
		};
		checkMobile();

		// Adding error handler for uncaught errors
		const handleError = (event) => {
			// console.error("Global error caught:", event.error);
			// Prevent the error from breaking the app
			event.preventDefault();
		};

		window.addEventListener("error", handleError);
		return () => window.removeEventListener("error", handleError);
	}, []);

	return (
		<>
			<LoadingScreen
				isModelLoaded={isModelLoaded}
				onLoadComplete={() => setIsLoaded(true)}
			/>
			<div className="mx-auto flex max-w-[1800px] flex-col items-center justify-center bg-neutral-50">
				<Hero
					onModelLoaded={() => setIsModelLoaded(true)}
					shouldAnimate={isLoaded}
				/>
				<Newsletter />
				<Events />
				<Gallery />
			</div>
		</>
	);
}
