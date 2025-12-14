"use client";

import { useState } from "react";
import { X, Lock, Send } from "lucide-react";

export default function SubmissionModal({ formConfig, onClose, onSuccess }) {
	const [adminSecret, setAdminSecret] = useState("");
	const [formAdminSecret, setFormAdminSecret] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			// Submit to API
			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const response = await fetch(`${apiUrl}/api/v1/forms/admin/config`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Admin-Secret": adminSecret,
					"X-Form-Admin-Secret": formAdminSecret,
				},
				body: JSON.stringify(formConfig),
			});

			const result = await response.json();

			if (result.success) {
				alert("Form configuration saved successfully!");
				onSuccess();
			} else {
				setError(result.error || "Failed to save form configuration");
			}
		} catch (error) {
			console.error("Submission error:", error);
			setError("Network error. Please check if the server is running.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
			<div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800/50 shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
								<Lock className="h-5 w-5 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-white">Confirm Submission</h2>
								<p className="text-orange-100 text-sm">Publish your form configuration</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
						>
							<X size={20} />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="mb-6">
						<p className="mb-4 text-zinc-300">
							You are about to publish the form configuration:
						</p>
						<div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 space-y-3">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
									<span className="text-orange-400 text-sm font-bold">📝</span>
								</div>
								<div>
									<p className="font-medium text-white">{formConfig.eventTitle}</p>
									<p className="text-sm text-zinc-400">{formConfig.eventSlug}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-700/50">
								<div className="text-center">
									<p className="text-2xl font-bold text-white">{formConfig.fields.length}</p>
									<p className="text-xs text-zinc-400">Fields</p>
								</div>
								<div className="text-center">
									<p className="text-sm font-medium text-white capitalize">{formConfig.formType}</p>
									<p className="text-xs text-zinc-400">
										{formConfig.formType === "payment" && formConfig.paymentConfig?.enabled 
											? `₹${formConfig.paymentConfig.amount}` 
											: "Form Type"
										}
									</p>
								</div>
							</div>
						</div>
					</div>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4 mb-6">
						<div>
							<label className="mb-2 block text-sm font-medium text-zinc-200">
								Admin Secret
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
								<input
									type="password"
									value={adminSecret}
									onChange={(e) => setAdminSecret(e.target.value)}
									placeholder="Enter admin secret"
									className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700/50 bg-zinc-800/50 text-white placeholder-zinc-500 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-none transition-all duration-200"
									required
									disabled={isSubmitting}
								/>
							</div>
						</div>
						
						<div>
							<label className="mb-2 block text-sm font-medium text-zinc-200">
								Form Admin Secret
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
								<input
									type="password"
									value={formAdminSecret}
									onChange={(e) => setFormAdminSecret(e.target.value)}
									placeholder="Enter form admin secret"
									className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700/50 bg-zinc-800/50 text-white placeholder-zinc-500 focus:border-red-500/50 focus:bg-zinc-800 focus:outline-none transition-all duration-200"
									required
									disabled={isSubmitting}
								/>
							</div>
							<p className="mt-1 text-xs text-zinc-500">Enhanced security for form operations</p>
						</div>
					</div>

					{error && (
						<div className="mb-6 rounded-xl bg-red-900/30 border border-red-700/50 p-4 flex items-center gap-3">
							<div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
								<span className="text-red-400 text-sm">⚠</span>
							</div>
							<p className="text-sm text-red-200">{error}</p>
						</div>
					)}

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-3 rounded-xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors font-medium"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-black font-medium hover:from-orange-400 hover:to-orange-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSubmitting || !adminSecret || !formAdminSecret}
						>
							{isSubmitting ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
									Publishing...
								</>
							) : (
								<>
									<Send size={16} />
									Publish Form
								</>
							)}
						</button>
					</div>
				</form>
			</div>
			</div>
		</div>
	);
}