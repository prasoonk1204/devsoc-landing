import { notFound } from "next/navigation";
import EventDetail from "@/components/Pages/EventDetail";
import { listContent } from "@/lib/server/content";
export default async function Page({ params }) {
	const { slug } = await params;
	const event = (await listContent("events")).find(
		(event) => event.slug === slug,
	);
	if (!event) notFound();
	return <EventDetail event={event} />;
}
