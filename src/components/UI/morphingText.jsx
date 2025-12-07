"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const morphTime = 1.56;
const defaultCooldownTime = 1.04;

const useMorphingText = (texts, customTimings = []) => {
	const textIndexRef = useRef(0);
	const morphRef = useRef(0);
	const cooldownRef = useRef(0);
	const timeRef = useRef(new Date());

	const text1Ref = useRef(null);
	const text2Ref = useRef(null);

	// Get cooldown time for current text
	const getCurrentCooldownTime = useCallback(() => {
		if (customTimings.length > 0) {
			const currentIndex = textIndexRef.current % texts.length;
			return customTimings[currentIndex] || defaultCooldownTime;
		}
		return defaultCooldownTime;
	}, [customTimings, texts.length]);

	const setStyles = useCallback(
		(fraction) => {
			const [current1, current2] = [text1Ref.current, text2Ref.current];
			if (!current1 || !current2) return;

			// Smoother easing for blur
			const easedFraction =
				fraction < 0.5
					? 2 * fraction * fraction
					: 1 - Math.pow(-2 * fraction + 2, 2) / 2;

			current2.style.filter = `blur(${Math.min(6 / easedFraction - 6, 100)}px)`;
			current2.style.opacity = `${Math.pow(easedFraction, 0.3) * 100}%`;

			const invertedFraction = 1 - easedFraction;
			current1.style.filter = `blur(${Math.min(
				6 / invertedFraction - 6,
				100,
			)}px)`;
			current1.style.opacity = `${Math.pow(invertedFraction, 0.3) * 100}%`;

			current1.textContent = texts[textIndexRef.current % texts.length];
			current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
		},
		[texts],
	);

	const doMorph = useCallback(() => {
		morphRef.current -= cooldownRef.current;
		cooldownRef.current = 0;

		let fraction = morphRef.current / morphTime;

		if (fraction > 1) {
			cooldownRef.current = getCurrentCooldownTime();
			fraction = 1;
		}

		setStyles(fraction);

		if (fraction === 1) {
			textIndexRef.current++;
		}
	}, [setStyles, getCurrentCooldownTime]);

	const doCooldown = useCallback(() => {
		morphRef.current = 0;
		const [current1, current2] = [text1Ref.current, text2Ref.current];
		if (current1 && current2) {
			current2.style.filter = "none";
			current2.style.opacity = "100%";
			current1.style.filter = "none";
			current1.style.opacity = "0%";
		}
	}, []);

	useEffect(() => {
		let animationFrameId;

		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			const newTime = new Date();
			const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
			timeRef.current = newTime;

			cooldownRef.current -= dt;

			if (cooldownRef.current <= 0) doMorph();
			else doCooldown();
		};

		animate();
		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [doMorph, doCooldown]);

	return { text1Ref, text2Ref, textIndexRef, cooldownRef };
};

const Texts = ({ texts, links, customTimings }) => {
	const { text1Ref, text2Ref, textIndexRef, cooldownRef } = useMorphingText(
		texts,
		customTimings,
	);

	const handleClick = () => {
		if (links && links.length > 0) {
			let currentIndex = textIndexRef.current;
			// If we are in the morphing phase (cooldown <= 0), the index hasn't updated yet,
			// but the user sees the next person fading in. So we target the next person.
			if (cooldownRef.current <= 0) {
				currentIndex += 1;
			}
			const link = links[currentIndex % links.length];
			if (link) {
				window.open(link, "_blank", "noopener,noreferrer");
			}
		}
	};

	return (
		<>
			<span
				className="inline-block w-full cursor-pointer"
				ref={text1Ref}
				onClick={handleClick}
			/>
			<span
				className="absolute inset-0 inline-block w-full cursor-pointer"
				ref={text2Ref}
				onClick={handleClick}
			/>
		</>
	);
};

const SvgFilters = () => (
	<svg
		id="filters"
		className="fixed h-0 w-0"
		preserveAspectRatio="xMidYMid slice"
	>
		<defs>
			<filter id="threshold">
				<feColorMatrix
					in="SourceGraphic"
					type="matrix"
					values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
				/>
			</filter>
		</defs>
	</svg>
);

export const MorphingText = ({ texts, className, links, customTimings }) => (
	<span
		className={cn(
			"relative inline-block text-left font-sans leading-none font-bold filter-[url(#threshold)_blur(0.4px)]",
			className,
		)}
	>
		<Texts texts={texts} links={links} customTimings={customTimings} />
		<SvgFilters />
	</span>
);
