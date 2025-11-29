"use client";

import { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { FallbackImage } from "./astronaut/FallbackImage";
import { AstronautCanvas } from "./astronaut/AstronautCanvas";
import { useAstronautLoader } from "./astronaut/useAstronautLoader";

// Preload on module load for faster initial render
if (typeof window !== "undefined") {
	const link = document.createElement("link");
	link.rel = "preload";
	link.href = "/astronaut.glb";
	link.as = "fetch";
	link.crossOrigin = "anonymous";
	document.head.appendChild(link);
}

export default function AstronautScene({ onModelLoaded }) {
	const mouse = useRef({ x: 0, y: 0 });

	const { ref: containerRef, inView: isAstronautVisible } = useInView({
		threshold: 0.1,
		triggerOnce: false,
		initialInView: true,
		rootMargin: "100px", // Start loading slightly before visible
	});

	const { showFallback, skipCanvas, handleCanvasError, handleModelLoaded } =
		useAstronautLoader(onModelLoaded);

	useEffect(() => {
		mouse.current = {
			x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
			y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
		};

		// Throttle mouse move for better performance
		let rafId = null;
		let lastUpdate = 0;
		const throttleMs = 32; // ~30fps for mouse tracking (sufficient for smooth feel)

		const handleMouseMove = (event) => {
			const now = Date.now();
			if (now - lastUpdate < throttleMs) return;

			if (rafId) return;

			rafId = requestAnimationFrame(() => {
				mouse.current = { x: event.clientX, y: event.clientY };
				lastUpdate = now;
				rafId = null;
			});
		};

		if (typeof window !== "undefined") {
			window.addEventListener("mousemove", handleMouseMove, { passive: true });
			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				if (rafId) cancelAnimationFrame(rafId);
			};
		}
	}, []);

	// Show fallback if needed
	if (showFallback || skipCanvas) {
		return <FallbackImage />;
	}

	return (
		<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
			<AstronautCanvas
				mouse={mouse}
				isAstronautVisible={isAstronautVisible}
				onCanvasError={handleCanvasError}
				onModelLoaded={handleModelLoaded}
			/>
		</div>
	);
}
