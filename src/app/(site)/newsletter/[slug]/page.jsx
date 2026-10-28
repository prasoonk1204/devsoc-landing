import { notFound } from "next/navigation";
import NewsletterDetail from "@/components/Pages/NewsletterDetail";
import { listContent } from "@/lib/server/content";
export default async function Page({ params }) {
	const { slug } = await params;
	const newsletter = (await listContent("newsletters")).find(
		(entry) => entry.slug === slug,
	);
	if (!newsletter) notFound();
	return <NewsletterDetail newsletter={newsletter} />;
}
