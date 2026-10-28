import About from "@/components/Pages/About";
import { listContent } from "@/lib/server/content";
export default async function Page() {
	return <About members={await listContent("members")} />;
}
