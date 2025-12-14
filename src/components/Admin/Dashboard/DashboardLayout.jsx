"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Settings, LogOut, ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children, activeView, setActiveView, onLogout }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const router = useRouter();

	const menuItems = [
		{ id: "events", label: "Events", icon: LayoutDashboard },
		{ id: "registrations", label: "Registrations", icon: Users },
		// { id: "settings", label: "Settings", icon: Settings },
	];

	return (
		<div className="min-h-screen bg-black text-white flex">
			{/* Sidebar (Desktop) */}
			<aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl fixed h-full z-40">
				<div className="p-6 border-b border-zinc-800">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
							<span className="font-bold text-white">D</span>
						</div>
						<span className="font-bold text-lg tracking-tight">DevSoc Admin</span>
					</div>
				</div>

				<nav className="flex-1 p-4 space-y-1">
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveView(item.id)}
							className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
								activeView === item.id
									? "bg-zinc-900 text-white shadow-lg shadow-orange-900/10 border border-zinc-800"
									: "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
							}`}
						>
							<div className="flex items-center gap-3">
								<item.icon className={`h-5 w-5 ${activeView === item.id ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-300"}`} />
								<span className="font-medium">{item.label}</span>
							</div>
							{activeView === item.id && (
								<ChevronRight className="h-4 w-4 text-zinc-600" />
							)}
						</button>
					))}
				</nav>

				<div className="p-4 border-t border-zinc-800">
					<button
						onClick={onLogout}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
					>
						<LogOut className="h-5 w-5" />
						<span className="font-medium">Logout</span>
					</button>
				</div>
			</aside>

			{/* Mobile Sidebar Overlay */}
			{isMobileMenuOpen && (
				<div 
					className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Mobile Sidebar */}
			<div className={`fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
				<div className="p-6 border-b border-zinc-800 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
							<span className="font-bold text-white">D</span>
						</div>
						<span className="font-bold text-lg">DevSoc</span>
					</div>
					<button 
						onClick={() => setIsMobileMenuOpen(false)}
						className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-900"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<nav className="p-4 space-y-1">
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => {
								setActiveView(item.id);
								setIsMobileMenuOpen(false);
							}}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
								activeView === item.id
									? "bg-zinc-900 text-white border border-zinc-800"
									: "text-zinc-400 hover:text-white"
							}`}
						>
							<item.icon className="h-5 w-5" />
							<span>{item.label}</span>
						</button>
					))}
				</nav>
			</div>

			{/* Main Content */}
			<main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
				{/* Top Bar (Mobile) */}
				<header className="lg:hidden h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30">
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-900"
					>
						<Menu className="h-6 w-6" />
					</button>
					<span className="font-bold text-white">DevSoc Admin</span>
					<div className="w-10" />
				</header>

				{/* Content Area */}
				<div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
					{children}
				</div>
			</main>
		</div>
	);
}
