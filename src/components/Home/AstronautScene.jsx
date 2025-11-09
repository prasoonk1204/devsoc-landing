import React, { useRef, useEffect, useState, Suspense } from "react";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function AstronautModel({ mouse, isAstronautVisible }) {
	const [scale, setScale] = useState(5);

	useEffect(() => {
		const updateScale = () => {
			if (typeof window !== "undefined") {
				if (window.innerWidth < 768) {
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

	// Animate head tracking with mouse
	useFrame(() => {
		if (headRef.current && mouse.current && typeof window !== "undefined") {
			let targetX = 0;
			let targetY = 0;

			// Only follow cursor if astronaut is visible
			if (isAstronautVisible) {
				targetX = (mouse.current.x / window.innerWidth) * 2 - 1;
				targetY = -(mouse.current.y / window.innerHeight) * 2 + 1;
			}

			// Smoothly rotate head to follow cursor or return to initial position
			headRef.current.rotation.y = THREE.MathUtils.lerp(
				headRef.current.rotation.y,
				targetX * 0.8,
				0.1,
			);
			headRef.current.rotation.x = THREE.MathUtils.lerp(
				headRef.current.rotation.x,
				targetY * 0.5,
				0.1,
			);
		}
	});

	// Rotate model to face front (-90 degrees on Y axis)
	return (
		<group
			ref={modelGroup}
			position={[0, -2.4, 0]}
			rotation={[0, -Math.PI / 2, 0]}
			scale={scale}
		>
			<primitive object={scene} />
		</group>
	);
}

// Loading placeholder component
function LoadingPlaceholder() {
	return (
		<mesh>
			<boxGeometry args={[1, 2, 1]} />
			<meshStandardMaterial color="#ff6b35" opacity={0.3} transparent />
		</mesh>
	);
}

export default function AstronautScene() {
	const mouse = useRef({ x: 0, y: 0 });
	const containerRef = useRef(null);
	const [isAstronautVisible, setIsAstronautVisible] = useState(true);
	const [shouldLoad, setShouldLoad] = useState(false);

	useEffect(() => {
		// Initialize mouse position after mount
		mouse.current = {
			x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
			y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
		};

		const handleMouseMove = (event) => {
			mouse.current = { x: event.clientX, y: event.clientY };
		};

		const handleScroll = () => {
			if (containerRef?.current && typeof window !== "undefined") {
				const rect = containerRef.current.getBoundingClientRect();
				// Check if astronaut container is visible in viewport
				const inView = rect.bottom > 0 && rect.top < window.innerHeight;
				setIsAstronautVisible(inView);
				
				// Start loading when container is near viewport (500px buffer)
				if (rect.top < window.innerHeight + 500 && !shouldLoad) {
					setShouldLoad(true);
				}
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("scroll", handleScroll);

			// Initial check
			handleScroll();

			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				window.removeEventListener("scroll", handleScroll);
			};
		}
	}, [shouldLoad]);

	return (
		<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
			<Canvas
				camera={{ position: [0, 0.5, 5], fov: 50 }}
				style={{ width: "100%", height: "100%" }}
				dpr={[1, 2]}
				performance={{ min: 0.5 }}
			>
				<ambientLight intensity={0.6} />
				<directionalLight position={[3, 5, 5]} intensity={1.5} />
				<Environment preset="city" />
				{shouldLoad ? (
					<Suspense fallback={<LoadingPlaceholder />}>
						<AstronautModel mouse={mouse} isAstronautVisible={isAstronautVisible} />
					</Suspense>
				) : (
					<LoadingPlaceholder />
				)}
			</Canvas>
		</div>
	);
}

// Preload the model when idle
if (typeof window !== "undefined") {
	useGLTF.preload("/astronaut.glb");
}
