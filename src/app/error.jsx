"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
	useEffect(() => {
		// Log the error to an error reporting service
		// console.error("Application error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
			<div className="max-w-md text-center">
				<h2 className="mb-4 text-2xl font-bold text-zinc-900">
					Something went wrong!
				</h2>
				<p className="mb-6 text-zinc-600">
					We encountered an unexpected error. Please try again.
				</p>
				<button
					onClick={() => reset()}
					className="rounded-lg bg-zinc-900 px-6 py-3 text-white transition-colors hover:bg-zinc-800"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
