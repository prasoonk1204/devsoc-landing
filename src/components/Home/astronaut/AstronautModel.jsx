"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Preload the model
useGLTF.preload("/astronaut.glb");

export function AstronautModel({ mouse, isAstronautVisible, onModelLoaded }) {
	const modelGroup = useRef();
	const headRef = useRef();
	const [hasNotifiedLoad, setHasNotifiedLoad] = useState(false);

	// Load the model
	const { scene } = useGLTF("/astronaut.glb");

	const scale = 4.5;
	const [isOptimized, setIsOptimized] = useState(false);

	// Optimize and enhance scene on load
	useEffect(() => {
		if (!scene) return;

		// Batch updates for better performance
		let headFound = false;

		// Enhance materials and geometry
		scene.traverse((child) => {
			// Find the head bone (only if not found yet)
			if (!headFound && !headRef.current) {
				const name = child.name.toLowerCase();
				if (
					name.includes("head") ||
					name.includes("Bone-head") ||
					(name.includes("mixamorig") && name.includes("head"))
				) {
					headRef.current = child;
					headFound = true;
				}
			}

			// Enhance meshes
			if (child.isMesh) {
				child.castShadow = false;
				child.receiveShadow = false;
				child.frustumCulled = true;
				child.matrixAutoUpdate = false;
				child.updateMatrix();

				// Enhance materials for better appearance
				if (child.material) {
					// Clone material to avoid affecting other instances
					if (!isOptimized) {
						child.material = child.material.clone();
					}

					// Ensure proper color space
					if (child.material.map) {
						child.material.map.colorSpace = THREE.SRGBColorSpace;
						child.material.map.generateMipmaps = true;
						child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
						child.material.map.anisotropy = 2; // Balanced texture quality
					}

					// Keep materials clean and simple
					if (child.material.isMeshStandardMaterial) {
						// Preserve original material properties mostly
						const originalMetalness = child.material.metalness || 0;
						const originalRoughness = child.material.roughness || 0.5;

						child.material.metalness = Math.min(originalMetalness, 0.2);
						child.material.roughness = Math.max(originalRoughness, 0.4);
						child.material.envMapIntensity = 1.0;

						// Don't over-process colors - keep them natural
						if (child.material.color) {
							child.material.color.convertSRGBToLinear();
						}
					}

					child.material.needsUpdate = true;
				}

				// Optimize geometry
				if (child.geometry) {
					child.geometry.computeBoundingSphere();
					child.geometry.computeBoundingBox();
				}
			}
		});

		setIsOptimized(true);

		// Notify load complete immediately
		if (!hasNotifiedLoad) {
			setHasNotifiedLoad(true);
			// Use requestAnimationFrame for smoother transition
			requestAnimationFrame(() => {
				onModelLoaded?.();
			});
		}
	}, [scene, hasNotifiedLoad, onModelLoaded]);

	// Reset head position when not visible
	useEffect(() => {
		if (!isAstronautVisible && headRef.current) {
			// Smoothly reset head to center position
			const resetInterval = setInterval(() => {
				if (!headRef.current) {
					clearInterval(resetInterval);
					return;
				}

				const currentY = headRef.current.rotation.y;
				const currentZ = headRef.current.rotation.z;

				// Check if already centered
				if (Math.abs(currentY) < 0.01 && Math.abs(currentZ) < 0.01) {
					headRef.current.rotation.y = 0;
					headRef.current.rotation.z = 0;
					clearInterval(resetInterval);
					return;
				}

				// Lerp towards center
				headRef.current.rotation.y = THREE.MathUtils.lerp(currentY, 0, 0.1);
				headRef.current.rotation.z = THREE.MathUtils.lerp(currentZ, 0, 0.1);
			}, 16); // ~60fps

			return () => clearInterval(resetInterval);
		}
	}, [isAstronautVisible]);

	// Animate head tracking with mouse (smooth and responsive)
	useFrame((_state, delta) => {
		if (headRef.current && mouse.current && isAstronautVisible) {
			const targetX = (mouse.current.x / window.innerWidth) * 2 - 1;
			const targetZ = (mouse.current.y / window.innerHeight) * 2 - 1;

			// Smooth interpolation with delta time
			const lerpFactor = Math.min(delta * 6, 0.2);

			headRef.current.rotation.y = THREE.MathUtils.lerp(
				headRef.current.rotation.y,
				targetX * 0.8,
				lerpFactor,
			);
			headRef.current.rotation.z = THREE.MathUtils.lerp(
				headRef.current.rotation.z,
				-targetZ * 0.5,
				lerpFactor,
			);
		}
	});

	const groupProps = useMemo(
		() => ({
			position: [0, -2.4, 0],
			rotation: [0, -Math.PI / 2, 0],
			scale: scale,
		}),
		[scale],
	);

	return (
		<group ref={modelGroup} {...groupProps}>
			<primitive object={scene} />
		</group>
	);
}
