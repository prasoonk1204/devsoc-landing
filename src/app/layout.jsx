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
import { ConvexProvider } from "@/providers/ConvexProvider";

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
		icon: "/DevSocLogo.png",
	},
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
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.className} ${iceland.variable} pb-18 antialiased md:pb-0`}
				suppressHydrationWarning
			>
				<ConvexProvider>
					<SmoothScroll />
					<Header />
					{children}
					<Footer />
				</ConvexProvider>
			</body>
		</html>
	);
}
