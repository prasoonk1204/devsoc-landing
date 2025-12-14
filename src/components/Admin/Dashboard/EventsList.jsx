"use client";

import { useState, useEffect } from "react";
import { Link } from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Users, ExternalLink, Calendar, Plus } from "lucide-react";
import FormAdminModal from "../FormAdminModal";

export default function EventsList({ adminSecret, onViewRegistrations }) {
	const [events, setEvents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [showFormAdminModal, setShowFormAdminModal] = useState(false);
	const [pendingAction, setPendingAction] = useState(null);
	const router = useRouter();

	useEffect(() => {
		fetchEvents();
	}, [adminSecret]);

	const fetchEvents = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/forms/admin/configs`, {
				headers: {
					"X-Admin-Secret": adminSecret,
				},
			});

			const result = await response.json();

			if (result.success) {
				setEvents(result.data);
			} else {
				setError(result.error || "Failed to fetch events");
			}
		} catch (err) {
			console.error("Error fetching events:", err);
			setError("Failed to connect to server");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = (eventSlug) => {
		if (!confirm(`Are you sure you want to delete the event "${eventSlug}"? This action cannot be undone.`)) {
			return;
		}
		
		setPendingAction({ type: 'delete', eventSlug });
		setShowFormAdminModal(true);
	};

	const executeDelete = async (eventSlug, formAdminSecret) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/forms/admin/${eventSlug}`, {
				method: "DELETE",
				headers: {
					"X-Admin-Secret": adminSecret,
					"X-Form-Admin-Secret": formAdminSecret,
				},
			});

			const result = await response.json();

			if (result.success) {
				setEvents(prev => prev.filter(e => e.eventSlug !== eventSlug));
			} else {
				alert(result.error || "Failed to delete event");
			}
		} catch (err) {
			console.error("Error deleting event:", err);
			alert("Failed to delete event");
		}
	};

	const handleToggleStatus = (event, currentStatus) => {
		setPendingAction({ type: 'toggle', event, currentStatus });
		setShowFormAdminModal(true);
	};

	const executeToggleStatus = async (event, currentStatus, formAdminSecret) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/forms/admin/${event.eventSlug}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"X-Admin-Secret": adminSecret,
					"X-Form-Admin-Secret": formAdminSecret,
				},
				body: JSON.stringify({ isActive: !currentStatus }),
			});

			const result = await response.json();

			if (result.success) {
				setEvents(prev => prev.map(e => 
					e.eventSlug === event.eventSlug ? { ...e, isActive: !currentStatus } : e
				));
			} else {
				alert(result.error || "Failed to update status");
			}
		} catch (err) {
			console.error("Error updating status:", err);
		}
	};

	const handleEdit = (eventSlug) => {
		setPendingAction({ type: 'edit', eventSlug });
		setShowFormAdminModal(true);
	};

	const executeEdit = (eventSlug, formAdminSecret) => {
		// Store form admin secret for the form builder
		sessionStorage.setItem("form_admin_secret", formAdminSecret);
		router.push(`/admin/form/${eventSlug}`);
	};

	const handleCreateNew = () => {
		setPendingAction({ type: 'create' });
		setShowFormAdminModal(true);
	};

	const executeCreateNew = (formAdminSecret) => {
		// Store form admin secret for the form builder
		sessionStorage.setItem("form_admin_secret", formAdminSecret);
		router.push("/admin/form/new");
	};

	const handleFormAdminSuccess = (formAdminSecret) => {
		setShowFormAdminModal(false);
		
		if (pendingAction) {
			switch (pendingAction.type) {
				case 'delete':
					executeDelete(pendingAction.eventSlug, formAdminSecret);
					break;
				case 'toggle':
					executeToggleStatus(pendingAction.event, pendingAction.currentStatus, formAdminSecret);
					break;
				case 'edit':
					executeEdit(pendingAction.eventSlug, formAdminSecret);
					break;
				case 'create':
					executeCreateNew(formAdminSecret);
					break;
			}
		}
		
		setPendingAction(null);
		// Clear the secret after a short delay for security
		setTimeout(() => {
			sessionStorage.removeItem("form_admin_secret");
		}, 30000); // 30 seconds
	};

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-48 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 rounded-2xl bg-red-900/20 border border-red-900/50 text-red-200">
				{error}
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-white">Events</h2>
					<p className="text-zinc-400">Manage all your event forms and configurations</p>
				</div>
				<button
					onClick={handleCreateNew}
					className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20"
				>
					<Plus size={18} />
					<span>Create New Event</span>
				</button>
			</div>

			{events.length === 0 ? (
				<div className="text-center py-20 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30">
					<div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center">
						<Calendar className="h-8 w-8 text-zinc-600" />
					</div>
					<h3 className="text-lg font-medium text-white mb-1">No events found</h3>
					<p className="text-zinc-500 mb-6">Get started by creating your first event form</p>
					<button
						onClick={handleCreateNew}
						className="text-orange-500 hover:text-orange-400 font-medium"
					>
						Create Event &rarr;
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{events.map((event) => (
						<div 
							key={event._id} 
							className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50"
						>
							<div className="flex items-start justify-between mb-4">
								<div>
									<h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
										{event.eventTitle}
									</h3>
									<code className="text-xs text-zinc-500 font-mono mt-1 block">
										{event.eventSlug}
									</code>
								</div>
								<div className={`h-8 px-3 rounded-full flex items-center gap-2 text-xs font-medium border ${event.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
									<div className={`w-1.5 h-1.5 rounded-full ${event.isActive ? "bg-green-500 animate-pulse" : "bg-zinc-500"}`} />
									{event.isActive ? "Active" : "Inactive"}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-6">
								<div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/50">
									<p className="text-xs text-zinc-500 mb-1">Form Type</p>
									<p className="text-sm font-medium text-white capitalize">{event.formType}</p>
								</div>
								<div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/50">
									<p className="text-xs text-zinc-500 mb-1">Fee</p>
									<p className="text-sm font-medium text-white">
										{event.paymentConfig?.enabled ? `₹${event.paymentConfig.amount}` : "Free"}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
								<button
									onClick={() => handleEdit(event.eventSlug)}
									className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium"
								>
									<Edit size={14} />
									Edit
								</button>
								<button
									onClick={() => onViewRegistrations(event.eventSlug)}
									className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium"
								>
									<Users size={14} />
									View
								</button>
								<button
									onClick={() => handleDelete(event.eventSlug)}
									className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 transition-all"
									title="Delete Event"
								>
									<Trash2 size={16} />
								</button>
							</div>

							{/* Active Toggle Switch */}
							<div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
								{/* Placeholder for future toggle if needed */}
							</div>
						</div>
					))}
				</div>
			)}

			<FormAdminModal
				isOpen={showFormAdminModal}
				onClose={() => {
					setShowFormAdminModal(false);
					setPendingAction(null);
				}}
				onSuccess={handleFormAdminSuccess}
				title={
					pendingAction?.type === 'delete' ? "Delete Event - Admin Verification" :
					pendingAction?.type === 'toggle' ? "Toggle Status - Admin Verification" :
					pendingAction?.type === 'edit' ? "Edit Event - Admin Verification" :
					pendingAction?.type === 'create' ? "Create Event - Admin Verification" :
					"Form Admin Access Required"
				}
			/>
		</div>
	);
}
