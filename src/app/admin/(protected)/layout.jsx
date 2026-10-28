import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminPrincipal } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
export const metadata = {
	title: "Admin | DevSoc",
	robots: { index: false, follow: false },
};
export default async function AdminLayout({ children }) {
	const principal = await getAdminPrincipal(
		new Request(process.env.APP_ORIGIN || "http://localhost:3000", {
			headers: await headers(),
		}),
	);
	if (!principal) redirect("/admin/login");
	return children;
}
