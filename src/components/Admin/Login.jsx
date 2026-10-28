"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/upload-image";
import Toast from "./Toast";
import "./admin.css";

export default function AdminLogin() {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const router = useRouter();
	const closeToast = useCallback(() => setError(""), []);
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setError("");
		try {
			await apiRequest("auth/login", { method: "POST", body: { password } });
			router.replace("/admin");
			router.refresh();
		} catch (error) {
			setError(error.message);
		} finally {
			setBusy(false);
		}
	}
	return (
		<main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
			<form
				onSubmit={submit}
				className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-7"
			>
				<h1 className="text-2xl font-semibold">DevSoc Admin</h1>
				<p className="text-sm text-zinc-400">
					Enter the admin password to continue.
				</p>
				<label className="block space-y-2">
					<span>Password</span>
					<input
						type="password"
						autoComplete="current-password"
						required
						maxLength={1024}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="w-full rounded-lg border border-zinc-600 bg-zinc-950 p-3 focus:outline-2 focus:outline-orange-300"
					/>
				</label>
				<Toast message={error} error onClose={closeToast} />
				<button
					disabled={busy}
					className="w-full rounded-lg bg-orange-300 p-3 font-semibold text-black disabled:opacity-50"
				>
					{busy ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</main>
	);
}
