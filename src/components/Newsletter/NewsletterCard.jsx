import Image from "next/image";
import Link from "next/link";

export default function NewsletterCard({ item }) {
	return (
		<Link href={`/newsletter/${item.slug}`}>
			<div className="group flex h-full transform flex-col overflow-hidden rounded-3xl bg-neutral-800 transition-all duration-300 ease-out hover:cursor-pointer hover:bg-neutral-700 hover:shadow-lg hover:shadow-orange-400/20">
				{/* Image container */}
				<div className="relative w-full">
					<Image
						src={item.image}
						alt={item.title}
						width={500}
						height={400}
						className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				</div>
				{/* Content */}
				<div className="flex flex-1 flex-col justify-between gap-2 p-4 font-sans">
					<h2 className="text-lg font-semibold text-white sm:text-xl">
						{item.title}
					</h2>
					<div className="flex justify-between text-sm text-neutral-300">
						<p>{item.author}</p>
						<p>{item.date}</p>
					</div>
				</div>
			</div>
		</Link>
	);
}