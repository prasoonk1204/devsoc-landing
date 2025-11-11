import React, {
	useRef,
	useEffect,
	useState,
	Suspense,
	useMemo,
	Component,
} from "react";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import * as THREE from "three";

// Error Boundary for catching React errors in 3D scene
class CanvasErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// console.error("Canvas Error Boundary caught:", error, errorInfo);
		this.props.onError?.(error);
	}

	render() {
		if (this.state.hasError) {
			return null;
		}
		return this.props.children;
	}
}

function AstronautModel({ mouse, isAstronautVisible, onModelLoaded }) {
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
	const [hasNotifiedLoad, setHasNotifiedLoad] = useState(false);

	// Notify when model is loaded
	useEffect(() => {
		if (scene && !hasNotifiedLoad) {
			setHasNotifiedLoad(true);
			onModelLoaded?.();
		}
	}, [scene, hasNotifiedLoad, onModelLoaded]);

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

// Check if WebGL is supported
function isWebGLAvailable() {
	try {
		const canvas = document.createElement("canvas");
		const gl =
			canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		return !!gl;
	} catch (e) {
		return false;
	}
}

export default function AstronautScene({ onModelLoaded, shouldAnimate }) {
	const mouse = useRef({ x: 0, y: 0 });
	const [hasWebGLError, setHasWebGLError] = useState(false);
	const [modelLoadTimeout, setModelLoadTimeout] = useState(false);
	const [webglSupported, setWebglSupported] = useState(true);
	const [showFallback, setShowFallback] = useState(false);
	const loadTimeoutRef = useRef(null);
	const { ref: containerRef, inView: isAstronautVisible } = useInView({
		threshold: 0.1,
		triggerOnce: false,
		initialInView: true,
	});

	// Check WebGL support on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const supported = isWebGLAvailable();
			if (!supported) {
				console.warn("WebGL not supported - showing fallback image");
				setWebglSupported(false);
				// Wait at least 1.5 seconds to show loading screen, then show fallback
				setTimeout(() => {
					setShowFallback(true);
					onModelLoaded?.();
				}, 1500);
			}
		}
	}, [onModelLoaded]);

	useEffect(() => {
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
			};
		}
	}, []);

	// Set a timeout for model loading - if it doesn't load in 5 seconds, show fallback
	useEffect(() => {
		// Only set timeout if WebGL is supported
		if (webglSupported) {
			loadTimeoutRef.current = setTimeout(() => {
				console.warn("Model loading timeout - showing fallback image");
				setModelLoadTimeout(true);
				setShowFallback(true);
				onModelLoaded?.();
			}, 5000);
		}

		return () => {
			if (loadTimeoutRef.current) {
				clearTimeout(loadTimeoutRef.current);
			}
		};
	}, [onModelLoaded, webglSupported]);

	// Handle WebGL and model loading errors
	const handleCanvasError = (error) => {
		if (error && typeof error === "object") {
			console.error("Canvas Error:", error.message || "Unknown error");
		}
		setHasWebGLError(true);
		// Clear the timeout since we're handling the error
		if (loadTimeoutRef.current) {
			clearTimeout(loadTimeoutRef.current);
		}
		// Wait at least 1.5 seconds to show loading screen, then show fallback
		setTimeout(() => {
			setShowFallback(true);
			onModelLoaded?.();
		}, 1500);
	};

	// Handle successful model load
	const handleModelLoaded = () => {
		// Clear the timeout since model loaded successfully
		if (loadTimeoutRef.current) {
			clearTimeout(loadTimeoutRef.current);
		}
		onModelLoaded?.();
	};

	// If WebGL is not supported, fails, or model doesn't load in time, show fallback image
	if (showFallback && (!webglSupported || hasWebGLError || modelLoadTimeout)) {
		return (
			<div className="flex h-full w-full items-end justify-center">
				<div className="relative h-full w-full max-w-[500px]">
					<Image
						src="/DevsocHero.png"
						alt="DevSoc Astronaut"
						fill
						className="object-contain object-bottom"
						priority
					/>
				</div>
			</div>
		);
	}

	// Don't render anything until we know if we need fallback or Canvas
	if (!webglSupported && !showFallback) {
		return null;
	}

	// Render Canvas with error handling
	try {
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
					<CanvasErrorBoundary onError={handleCanvasError}>
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
								failIfMajorPerformanceCaveat: false,
							}}
							onCreated={(state) => {
								// Check if WebGL context is valid
								try {
									const gl = state.gl.getContext();
									if (!gl) {
										handleCanvasError(new Error("WebGL context not available"));
									}
								} catch (err) {
									handleCanvasError(err);
								}
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
									onModelLoaded={handleModelLoaded}
								/>
							</Suspense>
						</Canvas>
					</CanvasErrorBoundary>
				</div>
			</div>
		);
	} catch (error) {
		// If Canvas rendering fails, show fallback
		handleCanvasError(error);
		if (showFallback) {
			return (
				<div className="flex h-full w-full items-end justify-center">
					<div className="relative h-full w-full max-w-[500px]">
						<Image
							src="/DevsocHero.png"
							alt="DevSoc Astronaut"
							fill
							className="object-contain object-bottom"
							priority
						/>
					</div>
				</div>
			);
		}
		return null;
	}
}

// Preload the model when idle
if (typeof window !== "undefined") {
	useGLTF.preload("/astronaut.glb");
}
