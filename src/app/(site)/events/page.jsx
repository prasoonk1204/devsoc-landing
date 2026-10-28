import Events from "@/components/Pages/Events";
import { listContent } from "@/lib/server/content";
export default async function Page() {
	return <Events eventsData={await listContent("events")} />;
}
