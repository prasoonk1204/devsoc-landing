"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DynamicForm from "../../../components/UI/DynamicForm";

export default function RegisterPage() {
	const params = useParams();
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState(""); // "success" or "error"

	const handleSuccess = (successMessage) => {
		setMessage(successMessage);
		setMessageType("success");

		// Redirect to success page after 3 seconds
		setTimeout(() => {
			router.push(`/register/${params.eventSlug}/success`);
		}, 3000);
	};

	const handleError = (errorMessage) => {
		setMessage(errorMessage);
		setMessageType("error");

		// Clear error message after 5 seconds
		setTimeout(() => {
			setMessage("");
			setMessageType("");
		}, 5000);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl font-bold text-gray-900">
						Event Registration
					</h1>
					<p className="text-gray-600">
						Complete the form below to register for the event
					</p>
				</div>

				{/* Message Display */}
				{message && (
					<div
						className={`mx-auto mb-6 max-w-2xl rounded-lg p-4 ${
							messageType === "success"
								? "border border-green-400 bg-green-100 text-green-700"
								: "border border-red-400 bg-red-100 text-red-700"
						}`}
					>
						<div className="flex items-center">
							<span className="mr-2">
								{messageType === "success" ? "✅" : "❌"}
							</span>
							{message}
						</div>
					</div>
				)}

				{/* Dynamic Form */}
				<DynamicForm
					eventSlug={params.eventSlug}
					onSuccess={handleSuccess}
					onError={handleError}
				/>

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-gray-500">
					<p>
						Having trouble? Contact support at{" "}
						<a
							href="mailto:support@example.com"
							className="text-blue-600 hover:underline"
						>
							support@example.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
