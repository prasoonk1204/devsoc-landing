"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasErrorBoundary, LoadingPlaceholder } from "./ErrorBoundary";
import { AstronautModel } from "./AstronautModel";

function CanvasContent({ mouse, isAstronautVisible, onModelLoaded }) {
	return (
		<>
			{/* Clean ambient light */}
			<ambientLight intensity={1.1} />

			{/* Main light from front-top */}
			<directionalLight
				position={[0, 5, 7]}
				intensity={2.0}
				color="#ffffff"
				castShadow={false}
			/>

			{/* Fill light from side */}
			<directionalLight
				position={[-5, 3, 3]}
				intensity={1.0}
				color="#ffffff"
				castShadow={false}
			/>

			<Suspense fallback={<LoadingPlaceholder />}>
				<AstronautModel
					mouse={mouse}
					isAstronautVisible={isAstronautVisible}
					onModelLoaded={onModelLoaded}
				/>
			</Suspense>
		</>
	);
}

export function AstronautCanvas({
	mouse,
	isAstronautVisible,
	onCanvasError,
	onModelLoaded,
}) {
	// Safe device pixel ratio check - optimize for performance
	const devicePixelRatio =
		typeof window !== "undefined" ? window.devicePixelRatio : 1;
	// Cap DPR to 1.5 for better performance without sacrificing quality
	const dpr = Math.min(devicePixelRatio, 1.5);
	const antialias = devicePixelRatio <= 1.5;

	return (
		<CanvasErrorBoundary onError={onCanvasError}>
			<div
				style={{
					width: "100%",
					height: "100%",
					visibility: isAstronautVisible ? "visible" : "hidden",
					pointerEvents: isAstronautVisible ? "auto" : "none",
				}}
			>
				<Canvas
					camera={{ position: [0, 0.5, 5], fov: 50 }}
					style={{ width: "100%", height: "100%" }}
					dpr={dpr}
					performance={{ min: 0.5, max: 1, debounce: 200 }}
					frameloop={isAstronautVisible ? "always" : "never"}
					gl={{
						powerPreference: "high-performance",
						antialias: antialias,
						stencil: false,
						depth: true,
						alpha: false,
						failIfMajorPerformanceCaveat: false,
						toneMapping: THREE.ACESFilmicToneMapping,
						toneMappingExposure: 1.2,
					}}
					onCreated={(state) => {
						if (!state.gl.getContext()) {
							onCanvasError();
						}
						// Enhanced renderer settings
						state.gl.setClearColor("#000000", 0);
						state.gl.outputColorSpace = THREE.SRGBColorSpace;
						// Enable performance optimizations
						const pixelRatio =
							typeof window !== "undefined" ? window.devicePixelRatio : 1;
						state.gl.setPixelRatio(Math.min(pixelRatio, 2));
					}}
					onError={onCanvasError}
				>
					<CanvasContent
						mouse={mouse}
						isAstronautVisible={isAstronautVisible}
						onModelLoaded={onModelLoaded}
					/>
				</Canvas>
			</div>
		</CanvasErrorBoundary>
	);
}
