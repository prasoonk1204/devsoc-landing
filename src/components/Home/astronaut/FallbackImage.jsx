import Image from "next/image";
import { useSite } from "@/providers/SiteProvider";

export function FallbackImage() {
	const { hero: HERO_IMG } = useSite();
	return (
		<div className="flex h-full w-full items-end justify-center bg-transparent">
			<div className="relative h-full w-full max-w-[500px]">
				{HERO_IMG && (
					<Image
						src={HERO_IMG}
						alt="DevSoc Astronaut"
						fill
						className="object-contain object-bottom"
						priority
						loading="eager"
						quality={90}
						sizes="(max-width: 768px) 100vw, 500px"
					/>
				)}
			</div>
		</div>
	);
}
