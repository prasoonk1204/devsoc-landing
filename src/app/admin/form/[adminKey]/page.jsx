"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormBuilder from "@/components/Admin/FormBuilder";

export default function AdminFormPage() {
	const params = useParams();
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const adminKey = params.adminKey;
		const validAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "admin-2024";

		if (adminKey === validAdminKey) {
			setIsAuthorized(true);
		} else {
			// Redirect to home page if admin key is invalid
			router.push("/");
			return;
		}

		setIsLoading(false);
	}, [params.adminKey, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-900">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	if (!isAuthorized) {
		return null; // Will redirect
	}

	return (
		<div className="min-h-screen bg-zinc-900">
			<FormBuilder />
		</div>
	);
}