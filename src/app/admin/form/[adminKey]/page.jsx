"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormBuilder from "@/components/Admin/FormBuilder";

export default function AdminFormPage() {
	const params = useParams();
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [editSlug, setEditSlug] = useState(null);

	useEffect(() => {
		const adminKey = params.adminKey;
		const validAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;
		
		// Check for session secrets from Dashboard
		const sessionSecret = sessionStorage.getItem("admin_secret");
		const formAdminSecret = sessionStorage.getItem("form_admin_secret");

		if (adminKey === validAdminKey && formAdminSecret) {
			// Direct access via admin key with form admin secret -> New Form
			setIsAuthorized(true);
		} else if (sessionSecret && formAdminSecret) {
			// Authenticated via Dashboard with form admin secret -> Editing Event (adminKey is slug)
			setIsAuthorized(true);
			setEditSlug(adminKey);
		} else {
			// Redirect to admin dashboard if unauthorized
			router.push(`/admin/${validAdminKey}`);
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
		return null;
	}

	return (
		<div className="min-h-screen bg-zinc-900">
			<FormBuilder initialSlug={editSlug} />
		</div>
	);
}