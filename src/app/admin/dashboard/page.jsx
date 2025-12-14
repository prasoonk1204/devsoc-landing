"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to the secure admin route
		const validAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
		router.push(`/admin/${validAdminKey}`);
	}, [router]);

	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-white">Redirecting to secure admin panel...</div>
		</div>
	);
}

