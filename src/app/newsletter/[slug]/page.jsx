"use client";

import { use } from "react";
import { newsletterItems } from "@/constant/newsletter";
import { notFound } from "next/navigation";
import BackButton from "@/components/UI/BackButton";
import NewsletterHeader from "@/components/Newsletter/NewsletterHeader";
import NewsletterDesktopGrid from "@/components/Newsletter/NewsletterDesktopGrid";
import NewsletterMobileCarousel from "@/components/Newsletter/NewsletterMobileCarousel";
import ImageZoomModal from "@/components/Newsletter/ImageZoomModal";
import { useNewsletterZoom } from "@/hooks/useNewsletterZoom";
import { formatNewsletterDate } from "@/lib/utils/formatDate";

export default function Page({ params }) {
	const { slug } = use(params);
	const newsletter = newsletterItems.find((item) => item.slug === slug);

	if (!newsletter) {
		notFound();
	}

	const {
		currentImageIndex,
		isZoomed,
		visibleImageIndex,
		nextImage,
		prevImage,
		goToImage,
		toggleZoom,
		openZoom,
	} = useNewsletterZoom(newsletter.images.length);

	return (
		<div className="flex w-full flex-col items-center justify-center gap-8 bg-black p-4 pt-20 pb-16 text-white sm:pb-24 md:pt-40">
			<div className="relative w-full max-w-6xl">
				<BackButton href="/newsletter" label="All Newsletters" />

				<NewsletterHeader
					title={newsletter.title}
					author={newsletter.author}
					date={formatNewsletterDate(newsletter.date)}
				/>

				<NewsletterDesktopGrid
					images={newsletter.images}
					title={newsletter.title}
					onImageClick={openZoom}
				/>

				<NewsletterMobileCarousel
					images={newsletter.images}
					title={newsletter.title}
					onImageClick={openZoom}
					visibleImageIndex={visibleImageIndex}
				/>

				<ImageZoomModal
					isOpen={isZoomed}
					images={newsletter.images}
					currentIndex={currentImageIndex}
					title={newsletter.title}
					onClose={toggleZoom}
					onNext={nextImage}
					onPrev={prevImage}
					onGoToImage={goToImage}
				/>
			</div>
		</div>
	);
}
