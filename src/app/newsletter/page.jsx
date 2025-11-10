// src/app/newsletter/page.jsx
import Newsletter from "@/components/Home/Newsletter";

export default function Page() {
	return (
		<div className="min-h-screen w-full bg-black">
			<Newsletter showViewMoreButton={false} />
		</div>
	);
}