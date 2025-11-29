import { useState, useEffect, useRef } from "react";
import { isSmallViewport, isMobileDevice, isWebGLAvailable } from "./utils";

export function useAstronautLoader(onModelLoaded) {
	const [hasWebGLError, setHasWebGLError] = useState(false);
	const [modelLoadTimeout, setModelLoadTimeout] = useState(false);
	const [webglSupported, setWebglSupported] = useState(true);
	const [showFallback, setShowFallback] = useState(false);
	const [modelLoaded, setModelLoaded] = useState(false);
	const [skipCanvas, setSkipCanvas] = useState(false);
	const loadTimeoutRef = useRef(null);
	const safetyTimeoutRef = useRef(null);

	// Early detection: Check device type, viewport size, and WebGL support
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Check if mobile device first - always use fallback for mobile hardware
			const isMobile = isMobileDevice();

			if (isMobile) {
				// Mobile device (phone/tablet) - always skip 3D model for performance
				// This applies even in desktop mode to save battery and improve performance
				setSkipCanvas(true);
				setShowFallback(true);
				onModelLoaded?.();
				return;
			}

			// Check if small viewport (for desktop browsers in small windows)
			const isSmall = isSmallViewport();

			if (isSmall) {
				// Small viewport on desktop - skip 3D model for performance
				setSkipCanvas(true);
				setShowFallback(true);
				onModelLoaded?.();
				return;
			}

			// Desktop device with large viewport - check WebGL support
			const supported = isWebGLAvailable();

			if (!supported) {
				setWebglSupported(false);
				setShowFallback(true);
				onModelLoaded?.();
				return;
			}
		}
	}, [onModelLoaded]);

	// Set a timeout for model loading on large viewports
	useEffect(() => {
		if (skipCanvas || showFallback || modelLoaded) return;

		// Reduced timeout for faster fallback on slow connections
		const timeout = 5000; // 5 seconds - reasonable for most connections

		if (webglSupported && !modelLoadTimeout) {
			loadTimeoutRef.current = setTimeout(() => {
				if (!modelLoaded) {
					setModelLoadTimeout(true);
					setShowFallback(true);
					onModelLoaded?.();
				}
			}, timeout);
		}

		// Safety timeout as last resort (7 seconds)
		safetyTimeoutRef.current = setTimeout(() => {
			if (!modelLoaded && !showFallback) {
				setModelLoadTimeout(true);
				setShowFallback(true);
				onModelLoaded?.();
			}
		}, 7000);

		return () => {
			if (loadTimeoutRef.current) {
				clearTimeout(loadTimeoutRef.current);
			}
			if (safetyTimeoutRef.current) {
				clearTimeout(safetyTimeoutRef.current);
			}
		};
	}, [
		webglSupported,
		modelLoaded,
		showFallback,
		skipCanvas,
		onModelLoaded,
		modelLoadTimeout,
	]);

	const handleCanvasError = () => {
		setHasWebGLError(true);
		if (loadTimeoutRef.current) {
			clearTimeout(loadTimeoutRef.current);
		}
		if (safetyTimeoutRef.current) {
			clearTimeout(safetyTimeoutRef.current);
		}

		// Immediately show fallback on error
		setShowFallback(true);
		onModelLoaded?.();
	};

	const handleModelLoaded = () => {
		setModelLoaded(true);
		if (loadTimeoutRef.current) {
			clearTimeout(loadTimeoutRef.current);
		}
		if (safetyTimeoutRef.current) {
			clearTimeout(safetyTimeoutRef.current);
		}
		onModelLoaded?.();
	};

	return {
		showFallback,
		skipCanvas,
		handleCanvasError,
		handleModelLoaded,
	};
}
