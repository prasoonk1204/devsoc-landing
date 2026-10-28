import { notFound, redirect } from "next/navigation";
import EventRegistration from "@/components/Pages/EventRegistration";
import { getEventForRegistration, listContent } from "@/lib/server/content";
export default async function Page({ params }) {
	const { slug } = await params;
	const published = (await listContent("events")).find(
		(event) => event.slug === slug,
	);
	if (published?.registrationMode === "external")
		redirect(published.externalRegistrationUrl);
	const event = await getEventForRegistration(slug);
	if (!event) notFound();
	return <EventRegistration event={event} />;
}
