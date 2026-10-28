import Newsletters from "@/components/Pages/Newsletters";
import { listContent } from "@/lib/server/content";
export default async function Page() {
	return <Newsletters newsletterItems={await listContent("newsletters")} />;
}
