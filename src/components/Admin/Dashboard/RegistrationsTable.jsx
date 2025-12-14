"use client";

import { useState, useEffect } from "react";
import { Search, Download, Filter, CheckCircle, XCircle, Clock } from "lucide-react";
import FormAdminModal from "../FormAdminModal";

export default function RegistrationsTable({ events, initialEventSlug, adminSecret }) {
	const [selectedEvent, setSelectedEvent] = useState(initialEventSlug || (events[0]?.eventSlug || ""));
	const [registrations, setRegistrations] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all, pending, completed, rejected
	const [showFormAdminModal, setShowFormAdminModal] = useState(false);

	useEffect(() => {
		if (selectedEvent) {
			fetchRegistrations(selectedEvent);
		}
	}, [selectedEvent]);

	const fetchRegistrations = async (slug) => {
		try {
			setIsLoading(true);
			// Note: Using the public endpoint for now as per existing setup. 
			// Ideally this should be an admin-secured endpoint.
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrations/${slug}`, {
				headers: {
					"X-Admin-Secret": adminSecret, // Sending it just in case backend is updated to require it
				},
			});
			const result = await response.json();

			if (result.success) {
				setRegistrations(result.data);
			} else {
				console.error("Failed to fetch registrations:", result.error);
				setRegistrations([]);
			}
		} catch (error) {
			console.error("Error fetching registrations:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredRegistrations = registrations.filter(reg => {
		const matchesSearch = 
			reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			reg.roll?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = statusFilter === "all" || 
			(reg.paymentStatus === statusFilter) || 
			(!reg.paymentStatus && statusFilter === "completed"); // Assume non-payment events are auto-completed

		return matchesSearch && matchesStatus;
	});

	const handleExportClick = () => {
		setShowFormAdminModal(true);
	};

	const handleExport = async (formAdminSecret) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/registrations/admin/${selectedEvent}/export`, {
				headers: {
					"X-Form-Admin-Secret": formAdminSecret,
				},
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `registrations-${selectedEvent}-${new Date().toISOString().split('T')[0]}.csv`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			} else {
				const result = await response.json();
				alert(result.error || "Failed to export registrations");
			}
		} catch (error) {
			console.error("Export error:", error);
			alert("Failed to export registrations");
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "approved":
			case "completed":
				return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle size={12} /> Approved</span>;
			case "pending":
			case "verification_pending":
				return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock size={12} /> Pending</span>;
			case "rejected":
				return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle size={12} /> Rejected</span>;
			default:
				return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">Registered</span>;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
				<div className="space-y-4 flex-1">
					<div>
						<h2 className="text-xl font-bold text-white">Registrations</h2>
						<p className="text-zinc-400 text-sm">View and manage participant registrations</p>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<select
							value={selectedEvent}
							onChange={(e) => setSelectedEvent(e.target.value)}
							className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 min-w-[200px]"
						>
							<option value="" disabled>Select Event</option>
							{events.map(event => (
								<option key={event.eventSlug} value={event.eventSlug}>
									{event.eventTitle}
								</option>
							))}
						</select>
						
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
							<input
								type="text"
								placeholder="Search by name, email, roll..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 active:bg-zinc-900"
							/>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
						{["all", "pending", "completed"].map((status) => (
							<button
								key={status}
								onClick={() => setStatusFilter(status)}
								className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
									statusFilter === status
										? "bg-zinc-800 text-white shadow-sm"
										: "text-zinc-500 hover:text-zinc-300"
								}`}
							>
								{status}
							</button>
						))}
					</div>
					<button
						onClick={handleExportClick}
						className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium"
						disabled={!selectedEvent}
					>
						<Download size={16} />
						<span className="hidden sm:inline">Export CSV</span>
					</button>
				</div>
			</div>

			<div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-zinc-950/50 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
								<th className="px-6 py-4 font-medium">Participant</th>
								<th className="px-6 py-4 font-medium">Additional Info</th>
								<th className="px-6 py-4 font-medium">Payment Info</th>
								<th className="px-6 py-4 font-medium">Status</th>
								<th className="px-6 py-4 font-medium text-right">Date</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800/50 text-sm">
							{isLoading ? (
								<tr>
									<td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
										<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
										<p>Loading registrations...</p>
									</td>
								</tr>
							) : filteredRegistrations.length === 0 ? (
								<tr>
									<td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
										No registrations found matching your criteria.
									</td>
								</tr>
							) : (
								filteredRegistrations.map((reg) => (
									<tr key={reg._id} className="group hover:bg-zinc-800/30 transition-colors">
										<td className="px-6 py-4">
											<div>
												<p className="font-medium text-white">{reg.name}</p>
												<p className="text-xs text-zinc-500">{reg.email}</p>
												<p className="text-xs text-zinc-500">{reg.phone}</p>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-zinc-300">
												<p><span className="text-zinc-500 text-xs">Roll:</span> {reg.roll}</p>
												<p><span className="text-zinc-500 text-xs">Dept:</span> {reg.department}</p>
												<p><span className="text-zinc-500 text-xs">Year:</span> {reg.year}</p>
											</div>
										</td>
										<td className="px-6 py-4">
											{reg.amount ? (
												<div>
													<p className="text-white font-medium">₹{reg.amount}</p>
													<p className="text-xs text-zinc-500 font-mono">{reg.transactionId}</p>
													{reg.paymentScreenshotUrl && (
														<a 
															href={reg.paymentScreenshotUrl} 
															target="_blank" 
															rel="noopener noreferrer"
															className="text-xs text-blue-400 hover:underline mt-1 inline-block"
														>
															View Screenshot
														</a>
													)}
												</div>
											) : (
												<span className="text-zinc-600 text-xs italic">Free Event</span>
											)}
										</td>
										<td className="px-6 py-4">
											{getStatusBadge(reg.paymentStatus || "registered")}
										</td>
										<td className="px-6 py-4 text-right text-zinc-500 tabular-nums">
											{new Date(reg._creationTime).toLocaleDateString()}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<FormAdminModal
				isOpen={showFormAdminModal}
				onClose={() => setShowFormAdminModal(false)}
				onSuccess={(formAdminSecret) => {
					setShowFormAdminModal(false);
					handleExport(formAdminSecret);
				}}
				title="CSV Export - Admin Verification"
			/>
		</div>
	);
}
