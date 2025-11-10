import { newsletterItems } from "@/constant/newsletter";
import Image from "next/image";
import Link from "next/link"; 
import { ArrowLeft } from "lucide-react"; 
import { notFound } from "next/navigation";

export default async function Page({ params }) {
	const { slug } = await params;
	const newsletter = newsletterItems.find((item) => item.slug === slug);

	if (!newsletter) {
		notFound();
	}

	return (
		<div className="flex w-full flex-col items-center justify-center gap-8 bg-black p-4 pt-12 pb-16 text-white sm:pb-24">
			<div className="mx-auto w-full max-w-6xl">
				{/* Back Button */}
				<Link
					href="/newsletter"
					className="mb-4 flex items-center gap-2 text-neutral-300 transition-all hover:gap-3 hover:text-white"
				>
					<ArrowLeft size={18} />
					<span className="font-sans text-sm">
						Back to newsletter
					</span>
				</Link>

				{/* Header */}
				<div className="mb-8 flex flex-col gap-2 border-b border-neutral-700 pb-4 font-sans">
					<h1 className="font-iceland text-4xl text-white sm:text-6xl">
						{newsletter.title}
					</h1>
					<div className="flex justify-between text-sm text-neutral-300 sm:text-lg">
						<p>By {newsletter.author}</p>
						<p>{newsletter.date}</p>
					</div>
				</div>

				{/* Content Section */}
				<div className="mb-8 font-sans text-base text-neutral-200 sm:text-lg">
					{newsletter.content.map((paragraph, index) => (
						<p key={index} className="mb-4">
							{paragraph}
						</p>
					))}
				</div>

				{/* Image Grid */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{newsletter.images.map((image, index) => (
						<Image
							key={index}
							src={image}
							alt={`${newsletter.title} image ${index + 1}`}
							width={1000} 
							height={1000} 
							className="h-auto w-full rounded-lg"
						/>
					))}
				</div>
			</div>
		</div>
	);
}