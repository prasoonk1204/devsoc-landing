import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSite } from "@/lib/server/content";
import { SiteProvider } from "@/providers/SiteProvider";
import Header from "@/components/UI/Header";
import Footer from "@/components/UI/Footer";
import SmoothScroll from "@/components/UI/SmoothScroll";
import MaintenancePage from "@/components/Maintenance/MaintenancePage";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
	const site = await getSite();
	return {
		icons: { icon: site.logo, apple: site.logo },
		openGraph: {
			title: "DevSoc",
			description: "Development Society of Asansol Engineering College",
			images: [
				{
					url: site.ogImage,
					width: 1200,
					height: 630,
					alt: "Development Society",
				},
			],
		},
		twitter: { card: "summary_large_image", images: [site.ogImage] },
	};
}
export default async function SiteLayout({ children }) {
	const site = await getSite();
	const pathname = (await headers()).get("x-devsoc-pathname") || "/";
	if (
		!site.maintenance &&
		site.eventOnlySlug &&
		pathname !== `/events/${site.eventOnlySlug}`
	)
		redirect(`/events/${site.eventOnlySlug}`);
	return (
		<SiteProvider site={site}>
			<div className="pb-18 md:pb-0">
				{site.maintenance ? (
					<MaintenancePage />
				) : (
					<>
						<SmoothScroll />
						{!site.eventOnlySlug && <Header />}
						{children}
						<Footer />
					</>
				)}
			</div>
		</SiteProvider>
	);
}
