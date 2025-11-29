import {
	Geist,
	Geist_Mono,
	Bricolage_Grotesque,
	Iceland,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/UI/Header";
import Footer from "@/components/UI/Footer";
import SmoothScroll from "@/components/UI/SmoothScroll";

import { Analytics } from "@vercel/analytics/next";
import { LOGO } from "@/constant/assets";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
	variable: "--font-bg",
	subsets: ["latin"],
});

const iceland = Iceland({
	variable: "--font-iceland",
	subsets: ["latin"],
	weight: ["400"],
});

export const metadata = {
	title: "DevSoc",
	description: "Development Society of Asansol Engineering College",

	icons: {
		icon: LOGO,
		shortcut: LOGO,
		apple: LOGO,
	},

	openGraph: {
		title: "DevSoc",
		description: "Development Society of Asansol Engineering College",
		url: "https://devsoc-aec.vercel.app/",
		siteName: "DevSoc",
		images: [
			{
				url: "https://ik.imagekit.io/devsoc/Website/og-banner.png",
				width: 1200,
				height: 630,
				alt: "Development Society",
			},
		],
		type: "website",
		locale: "en_US",
	},

	twitter: {
		card: "summary_large_image",
		title: "DevSoc",
		description: "Development Society of Asansol Engineering College",
		images: ["https://ik.imagekit.io/devsoc/Website/og-banner.png"],
	},

	robots: {
		index: true,
		follow: true,
	},

	metadataBase: new URL("https://devsoc-aec.vercel.app/"),
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="preload"
					href="/astronaut.glb"
					as="fetch"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="https://ik.imagekit.io/devsoc/Website/DevSocLogo.png"
					as="image"
				/>
				<link
					rel="preload"
					href="https://ik.imagekit.io/devsoc/Website/devsocbg.png"
					as="image"
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.className} ${iceland.variable} pb-18 antialiased md:pb-0`}
				suppressHydrationWarning
			>
				<SmoothScroll />
				<Header />
				{children}
				<Footer />
				<Analytics />
			</body>
		</html>
	);
}
