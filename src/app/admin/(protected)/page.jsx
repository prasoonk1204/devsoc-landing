import AdminPortal from "@/components/Admin/Portal";
import { listContent } from "@/lib/server/content";
export default async function Page() {
	const [site] = await listContent("settings", true);
	return <AdminPortal logo={site?.logo || ""} />;
}
