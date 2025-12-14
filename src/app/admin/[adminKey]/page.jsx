"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Admin/Dashboard/DashboardLayout";
import EventsList from "@/components/Admin/Dashboard/EventsList";
import RegistrationsTable from "@/components/Admin/Dashboard/RegistrationsTable";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminPage() {
	const params = useParams();
	const router = useRouter();
	const [adminSecret, setAdminSecret] = useState("");
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [activeView, setActiveView] = useState("events");
	const [viewEventSlug, setViewEventSlug] = useState("");
	const [eventsCache, setEventsCache] = useState([]);

	useEffect(() => {
		const adminKey = params.adminKey;
		const validAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;

		// Check if the admin key in URL matches the valid admin key
		if (adminKey !== validAdminKey) {
			// Redirect to home if invalid admin key
			router.push("/");
			return;
		}

		setIsAuthorized(true);

		// Check for saved secret in session storage
		const savedSecret = sessionStorage.getItem("admin_secret");
		if (savedSecret) {
			setAdminSecret(savedSecret);
			setIsAuthenticated(true);
		}

		setIsLoading(false);
	}, [params.adminKey, router]);

	const handleLogin = (e) => {
		e.preventDefault();
		if (adminSecret.trim()) {
			sessionStorage.setItem("admin_secret", adminSecret);
			setIsAuthenticated(true);
		}
	};

	const handleLogout = () => {
		sessionStorage.removeItem("admin_secret");
		sessionStorage.removeItem("form_admin_secret");
		setAdminSecret("");
		setIsAuthenticated(false);
	};

	// Helper to fetch events so we can pass them to table
	const updateEventsCache = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/forms/admin/configs`, {
				headers: {
					"X-Admin-Secret": adminSecret,
				},
			});
			const result = await response.json();
			if (result.success) {
				setEventsCache(result.data);
			}
		} catch (e) {
			console.error("Failed to fetch events cache");
		}
	};

	useEffect(() => {
		if (isAuthenticated && activeView === "registrations") {
			updateEventsCache();
		}
	}, [isAuthenticated, activeView]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	if (!isAuthorized) {
		return null;
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 mb-4">
							<Lock className="h-6 w-6 text-white" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Dashboard</h1>
						<p className="text-zinc-400">Enter your admin secret to continue</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<input
								type="password"
								value={adminSecret}
								onChange={(e) => setAdminSecret(e.target.value)}
								className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all"
								placeholder="Admin Secret"
								required
							/>
						</div>
						<button
							type="submit"
							className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
						>
							<span>Access Dashboard</span>
							<ArrowRight className="h-4 w-4" />
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<DashboardLayout 
			activeView={activeView} 
			setActiveView={setActiveView} 
			onLogout={handleLogout}
		>
			{activeView === "events" && (
				<EventsList 
					adminSecret={adminSecret} 
					onViewRegistrations={(slug) => {
						setViewEventSlug(slug);
						setActiveView("registrations");
					}}
				/>
			)}
			
			{activeView === "registrations" && (
				<RegistrationsTable 
					events={eventsCache}
					initialEventSlug={viewEventSlug}
					adminSecret={adminSecret}
				/>
			)}

			{activeView === "settings" && (
				<div className="flex flex-col items-center justify-center h-full text-zinc-500">
					<p>Global settings coming soon...</p>
				</div>
			)}
		</DashboardLayout>
	);
}