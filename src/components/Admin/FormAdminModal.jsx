"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

export default function FormAdminModal({ isOpen, onClose, onSuccess, title = "Form Admin Access Required" }) {
	const [formAdminSecret, setFormAdminSecret] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			// Store the form admin secret temporarily for the operation
			sessionStorage.setItem("form_admin_secret", formAdminSecret);
			onSuccess(formAdminSecret);
			setFormAdminSecret("");
		} catch (err) {
			setError("Invalid form admin secret");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setFormAdminSecret("");
		setError("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
			<div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
				<div className="flex items-center justify-between p-6 border-b border-zinc-800">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center">
							<Lock className="h-5 w-5 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-white">{title}</h2>
							<p className="text-sm text-zinc-400">Enhanced security verification required</p>
						</div>
					</div>
					<button
						onClick={handleClose}
						className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							Form Admin Secret
						</label>
						<input
							type="password"
							value={formAdminSecret}
							onChange={(e) => setFormAdminSecret(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all"
							placeholder="Enter form admin secret"
							required
							disabled={isLoading}
						/>
						{error && (
							<p className="mt-2 text-sm text-red-400">{error}</p>
						)}
					</div>

					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-all"
							disabled={isLoading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isLoading || !formAdminSecret.trim()}
						>
							{isLoading ? "Verifying..." : "Verify Access"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}