"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll() {
	const pathname = usePathname();
	const lenisRef = useRef(null);

	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true,
		});

		lenisRef.current = lenis;

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			lenis.destroy();
		};
	}, []);

	// Scroll to top on route change using Lenis
	useEffect(() => {
		if (lenisRef.current) {
			lenisRef.current.scrollTo(0, { immediate: true });
		} else {
			// Fallback if Lenis isn't ready yet
			window.scrollTo(0, 0);
		}
	}, [pathname]);

	return null;
}
