"use client";

import { useState, useEffect } from "react";
import Events from "@/components/Home/Events";
import Hero from "@/components/Home/Hero";
import Newsletter from "@/components/Home/Newsletter";
// import Gallery from "@/components/Home/Gallery";
import LoadingScreen from "@/components/Home/LoadingScreen";
import ModelPreloader from "@/components/Home/ModelPreloader";
import {
	isMobileDevice,
	isSmallViewport,
} from "@/components/Home/astronaut/utils";

export default function Home() {
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	// For mobile devices or small viewports, set model as loaded immediately
	useEffect(() => {
		if (typeof window !== "undefined") {
			const shouldSkip3D = isMobileDevice() || isSmallViewport();

			if (shouldSkip3D) {
				// Mobile device or small viewport - no 3D model shown, mark as loaded immediately
				setIsModelLoaded(true);
			}
		}

		// Global error handler to prevent app crashes
		const handleError = (event) => {
			event.preventDefault();
		};

		window.addEventListener("error", handleError);
		return () => window.removeEventListener("error", handleError);
	}, []);

	return (
		<>
			<ModelPreloader />
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
				{/* <Gallery /> */}
			</div>
		</>
	);
}
