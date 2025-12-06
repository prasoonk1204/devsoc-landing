/**
 * Custom ImageKit loader for Next.js Image component
 * This loader adds ImageKit transformations to optimize images
 */
export default function imagekitLoader({ src, width, quality }) {
	// If it's not an ImageKit URL, return as-is
	if (!src || !src.includes("ik.imagekit.io")) {
		return src;
	}

	try {
		const url = new URL(src);

		// Get existing transformation parameter if any
		const existingTr = url.searchParams.get("tr");

		// Build transformation string
		const transformations = [];

		// Add width transformation
		if (width) {
			transformations.push(`w-${width}`);
		}

		// Add quality transformation (default to 80 if not specified)
		const q = quality || 80;
		transformations.push(`q-${q}`);

		// Add format auto (WebP when supported)
		transformations.push("f-auto");

		// Add progressive rendering
		transformations.push("pr-true");

		// Combine with existing transformations if any
		let finalTr = transformations.join(",");
		if (existingTr) {
			finalTr = `${existingTr},${finalTr}`;
		}

		// Set the transformation parameter
		url.searchParams.set("tr", finalTr);

		return url.toString();
	} catch (error) {
		// console.error('Error in imagekitLoader:', error);
		// Return original src on error
		return src;
	}
}
