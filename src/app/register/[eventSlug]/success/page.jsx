"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";

export default function SuccessPage() {
	const params = useParams();

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
				>
					{/* Success Icon */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
					>
						<svg
							className="h-8 w-8 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</motion.div>

					{/* Success Message */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<h1 className="mb-4 text-2xl font-bold text-gray-900">
							Registration Successful!
						</h1>
						<p className="mb-6 text-gray-600">
							Thank you for registering for the event. You will receive a
							confirmation email shortly.
						</p>
					</motion.div>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="space-y-3"
					>
						<Link
							href={`/register/${params.eventSlug}`}
							className="block w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
						>
							Register Another Person
						</Link>

						<Link
							href="/"
							className="block w-full rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
						>
							Back to Home
						</Link>
					</motion.div>

					{/* Additional Info */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
						className="mt-8 border-t border-gray-200 pt-6"
					>
						<p className="text-sm text-gray-500">
							Registration ID:{" "}
							<span className="font-mono">
								{params.eventSlug}-{Date.now()}
							</span>
						</p>
						<p className="mt-2 text-xs text-gray-400">
							Keep this ID for your records
						</p>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
