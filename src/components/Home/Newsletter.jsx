"use client";

import { ArrowRight } from "lucide-react";
import { newsletterItems } from "@/constant/newsletter";
import NewsletterCard from "@/components/Newsletter/NewsletterCard";
import { formatNewsletterDate } from "@/lib/utils/formatDate";
import SectionHeader from "@/components/UI/SectionHeader";
import Container from "@/components/UI/Container";
import Button from "@/components/UI/Button";
import AnimatedContainer from "@/components/UI/AnimatedContainer";

export default function Newsletter({ showViewMoreButton = true }) {
	// Sort newsletters by date in descending order (latest first)
	const sortedNewsletters = [...newsletterItems].sort((a, b) => {
		return b.date.localeCompare(a.date);
	});

	return (
		<div className="z-2 flex w-full flex-col items-start justify-center gap-8 bg-black p-4 pt-12 pb-16 text-white sm:pb-24">
			<Container>
				<SectionHeader title="Newsletter" size="6xl" />

				<div className="flex flex-col gap-8">
					{sortedNewsletters.slice(0, 3).map((item, index) => (
						<NewsletterCard
							key={index}
							item={{ ...item, date: formatNewsletterDate(item.date) }}
							index={index}
						/>
					))}
				</div>

				{showViewMoreButton && (
					<AnimatedContainer
						variant="fadeInBlurFast"
						className="mt-8 flex justify-center"
					>
						<Button
							href="/newsletter"
							variant="accent"
							size="md"
							icon={<ArrowRight />}
							className="text-base sm:text-lg md:px-8 md:py-3"
						>
							View More
						</Button>
					</AnimatedContainer>
				)}
			</Container>
		</div>
	);
}
