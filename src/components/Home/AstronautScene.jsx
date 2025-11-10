import React, { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import * as THREE from "three";

function AstronautModel({ mouse, isAstronautVisible }) {
	const [scale, setScale] = useState(5);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const updateScale = () => {
			if (typeof window !== "undefined") {
				const mobile = window.innerWidth < 768;
				setIsMobile(mobile);
				if (mobile) {
					setScale(4.25);
				} else {
					setScale(4.5);
				}
			}
		};

		updateScale();
		if (typeof window !== "undefined") {
			window.addEventListener("resize", updateScale);
			return () => window.removeEventListener("resize", updateScale);
		}
	}, []);

	const { scene, animations } = useGLTF("/astronaut.glb", true);
	const modelGroup = useRef();
	const headRef = useRef();
	const { actions } = useAnimations(animations, scene);

	// Optimize materials for mobile
	useEffect(() => {
		if (isMobile) {
			scene.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = false;
					child.receiveShadow = false;
					if (child.material) {
						child.material.precision = "lowp";
					}
				}
			});
		}
	}, [scene, isMobile]);

	useEffect(() => {
		// Play first animation if available
		if (actions && Object.keys(actions).length > 0) {
			const firstAction = Object.values(actions)[0];
			firstAction.reset().fadeIn(0.5).play();
		}

		// Log all bones to find the head
		// console.log("=== Model Structure ===");
		scene.traverse((child) => {
			if (child.isBone || child.isObject3D) {
				// console.log("Found:", child.name, child.type);
			}

			const name = child.name.toLowerCase();
			// Search for head-related bones
			if (
				!headRef.current &&
				(name.includes("head") ||
					name.includes("Bone-head") ||
					(name.includes("mixamorig") && name.includes("head")))
			) {
				headRef.current = child;
				// console.log("Using as head:", child.name);
			}
		});

		// if (!headRef.current) {
		// 	// console.warn("⚠ No head found, listing all bones:");
		// 	scene.traverse((child) => {
		// 		if (child.isBone) console.log("Bone:", child.name);
		// 	});
		// }
	}, [scene, actions]);

	// Animate head tracking with mouse (skip on mobile for performance)
	useFrame(() => {
		if (
			!isMobile &&
			headRef.current &&
			mouse.current &&
			typeof window !== "undefined"
		) {
			let targetX = 0;
			let targetZ = 0;

			// Only follow cursor if astronaut is visible, with smooth damping
			if (isAstronautVisible) {
				targetX = (mouse.current.x / window.innerWidth) * 2 - 1;
				targetZ = (mouse.current.y / window.innerHeight) * 2 - 1;
			}
			// When not visible, targetX and targetZ remain 0, creating smooth transition to neutral

			// Smooth lerp with damping for natural motion
			headRef.current.rotation.y = THREE.MathUtils.lerp(
				headRef.current.rotation.y,
				targetX * 0.8,
				0.1,
			);
			// Use Z rotation for up-down to match the model's orientation (inverted)
			headRef.current.rotation.z = THREE.MathUtils.lerp(
				headRef.current.rotation.z,
				-targetZ * 0.5,
				0.1,
			);
		}
	});

	// Memoize group props for performance
	const groupProps = useMemo(
		() => ({
			position: [0, -2.4, 0],
			rotation: [0, -Math.PI / 2, 0],
			scale: scale,
		}),
		[scale],
	);

	// Rotate model to face front (-90 degrees on Y axis)
	return (
		<group ref={modelGroup} {...groupProps}>
			<primitive object={scene} />
		</group>
	);
}

// Loading placeholder component - invisible during load
function LoadingPlaceholder() {
	return null;
}

export default function AstronautScene() {
	const mouse = useRef({ x: 0, y: 0 });
	const { ref: containerRef, inView: isAstronautVisible } = useInView({
		threshold: 0.1,
		triggerOnce: false,
		initialInView: true,
	});
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Detect mobile device
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);

		// Initialize mouse position after mount
		mouse.current = {
			x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
			y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
		};

		const handleMouseMove = (event) => {
			mouse.current = { x: event.clientX, y: event.clientY };
		};

		if (typeof window !== "undefined") {
			window.addEventListener("mousemove", handleMouseMove);

			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("resize", checkMobile);
			};
		}
	}, []);

	// Show static image on mobile devices for better performance
	if (isMobile) {
		return (
			<div
				ref={containerRef}
				className="absolute right-0 bottom-0 left-0 flex items-end justify-center"
			>
				<div className="relative h-[300px] w-full max-w-[400px]">
					<Image
						src="/DevsocHero.png"
						alt="DevSoc Astronaut"
						fill
						className="object-contain object-bottom"
						priority
						sizes="(max-width: 768px) 100vw, 400px"
					/>
				</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
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
					dpr={[1, 2]}
					performance={{ min: 0.5 }}
					frameloop={isAstronautVisible ? "always" : "never"}
					gl={{
						powerPreference: "high-performance",
						antialias: true,
						stencil: false,
						depth: true,
					}}
				>
					<ambientLight intensity={0.6} />
					<directionalLight
						position={[3, 5, 5]}
						intensity={1.5}
						castShadow={false}
					/>
					<Environment preset="city" />
					<Suspense fallback={<LoadingPlaceholder />}>
						<AstronautModel
							mouse={mouse}
							isAstronautVisible={isAstronautVisible}
						/>
					</Suspense>
				</Canvas>
			</div>
		</div>
	);
}

// Preload the model when idle
if (typeof window !== "undefined") {
	useGLTF.preload("/astronaut.glb");
}
