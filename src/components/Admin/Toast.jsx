"use client";
import { useEffect } from "react";

export default function Toast({ message, error = false, onClose }) {
	useEffect(() => {
		if (!message || error) return;
		const timer = setTimeout(onClose, 6000);
		return () => clearTimeout(timer);
	}, [message, error, onClose]);
	return (
		<div className="admin-toast-region" aria-live="polite" aria-atomic="true">
			{message && (
				<div
					className={`admin-toast ${error ? "is-error" : ""}`}
					role={error ? "alert" : "status"}
				>
					<div>
						<strong>{error ? "Something went wrong" : "All set"}</strong>
						<p>{message}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Dismiss notification"
					>
						×
					</button>
				</div>
			)}
		</div>
	);
}
