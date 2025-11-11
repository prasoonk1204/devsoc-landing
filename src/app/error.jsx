"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
	useEffect(() => {
		// Log the error to an error reporting service
		// console.error("Application error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
			<div className="max-w-md text-center">
				<h2 className="mb-4 text-2xl font-bold text-neutral-900">
					Something went wrong!
				</h2>
				<p className="mb-6 text-neutral-600">
					We encountered an unexpected error. Please try again.
				</p>
				<button
					onClick={() => reset()}
					className="rounded-lg bg-neutral-900 px-6 py-3 text-white transition-colors hover:bg-neutral-800"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
