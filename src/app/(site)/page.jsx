import Home from "@/components/Pages/Home";
import { listContent } from "@/lib/server/content";
export default async function Page() {
	const [eventsData, newsletterItems] = await Promise.all([
		listContent("events"),
		listContent("newsletters"),
	]);
	return <Home eventsData={eventsData} newsletterItems={newsletterItems} />;
}
