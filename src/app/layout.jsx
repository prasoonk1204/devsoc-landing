import {
	Geist_Mono,
	Bricolage_Grotesque,
	Iceland,
	Inter,
} from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
	variable: "--font-inter",
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
	metadataBase: new URL(
		process.env.APP_ORIGIN || "https://devsoc-aec.vercel.app/",
	),
};
export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${geistMono.variable} ${bricolageGrotesque.className} ${iceland.variable} antialiased`}
				suppressHydrationWarning
			>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
