import Image from "next/image";
import { HERO_IMG } from "@/constant/assets";

export function FallbackImage() {
	return (
		<div className="flex h-full w-full items-end justify-center bg-transparent">
			<div className="relative h-full w-full max-w-[500px]">
				<Image
					src={HERO_IMG}
					alt="DevSoc Astronaut"
					fill
					className="object-contain object-bottom"
					priority
					loading="eager"
				/>
			</div>
		</div>
	);
}
