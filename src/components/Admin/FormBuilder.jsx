"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, RotateCcw, Eye, Settings } from "lucide-react";
import FieldEditor from "./FieldEditor";
import FormPreview from "./FormPreview";
import SubmissionModal from "./SubmissionModal";

const FIELD_TYPES = [
	{ value: "text", label: "Text Input" },
	{ value: "email", label: "Email" },
	{ value: "tel", label: "Phone" },
	{ value: "textarea", label: "Textarea" },
	{ value: "select", label: "Select Dropdown" },
	{ value: "radio", label: "Radio Buttons" },
	{ value: "checkbox", label: "Checkbox" },
	{ value: "file", label: "File Upload" },
	{ value: "number", label: "Number" },
	{ value: "date", label: "Date" },
];

const FORM_TYPES = [
	{ value: "simple", label: "Simple Form" },
	{ value: "payment", label: "Payment Form" },
	{ value: "custom", label: "Custom Form" },
];

export default function FormBuilder({ initialSlug }) {
	const [formConfig, setFormConfig] = useState(() => {
		// If editing existing form, ignore local storage default load (will be fetched)
		if (initialSlug) {
			return {
				eventSlug: initialSlug,
				eventTitle: "",
				formType: "simple",
				isActive: true,
				fields: [],
				paymentConfig: {
					enabled: false,
					amount: 0,
					qrCodeUrl: "",
					upiId: "",
					instructions: "",
				},
				styling: {
					theme: "light",
					primaryColor: "#3B82F6",
					backgroundColor: "#FFFFFF",
				},
			};
		}
		
		// Load from localStorage on component mount (only for new form)
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("formBuilder_config");
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch (e) {
					console.error("Failed to parse saved form config:", e);
				}
			}
		}
		
		return {
			eventSlug: "",
			eventTitle: "",
			formType: "simple",
			isActive: true,
			fields: [],
			paymentConfig: {
				enabled: false,
				amount: 0,
				qrCodeUrl: "",
				upiId: "",
				instructions: "",
			},
			styling: {
				theme: "light",
				primaryColor: "#3B82F6",
				backgroundColor: "#FFFFFF",
			},
		};
	});

	const [activeTab, setActiveTab] = useState("builder");
	const [editingField, setEditingField] = useState(null);
	const [showSubmissionModal, setShowSubmissionModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch existing config if initialSlug provided
	useEffect(() => {
		if (initialSlug) {
			const fetchConfig = async () => {
				setIsLoading(true);
				try {
					const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/forms/${initialSlug}/config`);
					const result = await response.json();
					if (result.success) {
						setFormConfig(result.data);
					} else if (response.status === 404) {
						// Form config doesn't exist yet - start with default config for this slug
						setFormConfig(prev => ({
							...prev,
							eventSlug: initialSlug,
							eventTitle: initialSlug.split('-').map(word => 
								word.charAt(0).toUpperCase() + word.slice(1)
							).join(' ')
						}));
					} else {
						console.error("Failed to load form config:", result.error);
						// For other errors, still set the slug so user can create the form
						setFormConfig(prev => ({
							...prev,
							eventSlug: initialSlug,
							eventTitle: initialSlug.split('-').map(word => 
								word.charAt(0).toUpperCase() + word.slice(1)
							).join(' ')
						}));
					}
				} catch (error) {
					console.error("Error fetching form config:", error);
					// On network error, still set the slug so user can create the form
					setFormConfig(prev => ({
						...prev,
						eventSlug: initialSlug,
						eventTitle: initialSlug.split('-').map(word => 
							word.charAt(0).toUpperCase() + word.slice(1)
						).join(' ')
					}));
				} finally {
					setIsLoading(false);
				}
			};
			fetchConfig();
		}
	}, [initialSlug]);

	// Save to localStorage whenever formConfig changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("formBuilder_config", JSON.stringify(formConfig));
		}
	}, [formConfig]);

	const addField = (type) => {
		const newField = {
			id: `field_${Date.now()}`,
			type,
			label: `New ${type} field`,
			placeholder: "",
			required: false,
			options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1"] : undefined,
			validation: {},
		};

		setFormConfig(prev => ({
			...prev,
			fields: [...prev.fields, newField],
		}));
		setEditingField(newField.id);
	};

	const updateField = (fieldId, updates) => {
		setFormConfig(prev => ({
			...prev,
			fields: prev.fields.map(field =>
				field.id === fieldId ? { ...field, ...updates } : field
			),
		}));
	};

	const deleteField = (fieldId) => {
		setFormConfig(prev => ({
			...prev,
			fields: prev.fields.filter(field => field.id !== fieldId),
		}));
		if (editingField === fieldId) {
			setEditingField(null);
		}
	};

	const moveField = (fieldId, direction) => {
		setFormConfig(prev => {
			const fields = [...prev.fields];
			const index = fields.findIndex(f => f.id === fieldId);
			if (index === -1) return prev;

			const newIndex = direction === "up" ? index - 1 : index + 1;
			if (newIndex < 0 || newIndex >= fields.length) return prev;

			[fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
			return { ...prev, fields };
		});
	};

	const resetForm = () => {
		if (confirm("Are you sure you want to reset the form? This will clear all your work.")) {
			const defaultConfig = {
				eventSlug: "",
				eventTitle: "",
				formType: "simple",
				isActive: true,
				fields: [],
				paymentConfig: {
					enabled: false,
					amount: 0,
					qrCodeUrl: "",
					upiId: "",
					instructions: "",
				},
				styling: {
					theme: "light",
					primaryColor: "#3B82F6",
					backgroundColor: "#FFFFFF",
				},
			};
			setFormConfig(defaultConfig);
			setEditingField(null);
			localStorage.removeItem("formBuilder_config");
		}
	};

	const handleSubmit = () => {
		// Validate required fields
		if (!formConfig.eventSlug || !formConfig.eventTitle || formConfig.fields.length === 0) {
			alert("Please fill in event slug, title, and add at least one field.");
			return;
		}

		// Validate event slug format
		if (!/^[a-z0-9-]+$/.test(formConfig.eventSlug)) {
			alert("Event slug must contain only lowercase letters, numbers, and hyphens.");
			return;
		}

		setShowSubmissionModal(true);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black">
				<div className="text-white">Loading configuration...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
			{/* Header */}
			<div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="h-16 grid grid-cols-3 items-center">
						<div className="flex items-center gap-3 justify-start">
							<div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
								<Settings className="h-5 w-5 text-white" />
							</div>
							<div className="flex flex-col">
								<h1 className="text-lg font-bold text-white leading-tight">
									Form Builder
								</h1>
								<p className="text-xs text-zinc-400">Design & Configure</p>
							</div>
						</div>

						{/* Center Tabs - Hidden on XL screens */}
						<div className="hidden md:flex xl:hidden justify-center">
							<div className="flex p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
								<button
									onClick={() => setActiveTab("builder")}
									className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
										activeTab === "builder"
											? "bg-zinc-800 text-white shadow-sm"
											: "text-zinc-500 hover:text-zinc-300"
									}`}
								>
									<Settings className="h-4 w-4" />
									<span>Builder</span>
								</button>
								<button
									onClick={() => setActiveTab("preview")}
									className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
										activeTab === "preview"
											? "bg-zinc-800 text-white shadow-sm"
											: "text-zinc-500 hover:text-zinc-300"
									}`}
								>
									<Eye className="h-4 w-4" />
									<span>Preview</span>
								</button>
							</div>
						</div>

						<div className="flex items-center gap-3 justify-end">
							<button
								onClick={resetForm}
								className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-200"
							>
								<RotateCcw size={14} />
								<span>Reset</span>
							</button>
							<button
								onClick={handleSubmit}
								className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg shadow-orange-900/20"
							>
								<Save size={16} />
								<span>Publish</span>
							</button>
						</div>
					</div>
				</div>
			</div>
			
			{/* Mobile Tabs - Hidden on XL screens */}
			<div className="md:hidden xl:hidden sticky top-16 z-30 bg-zinc-950 border-b border-zinc-800 px-4 py-2">
				<div className="flex p-1 rounded-lg bg-zinc-900">
					<button
						onClick={() => setActiveTab("builder")}
						className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
							activeTab === "builder" ? "bg-zinc-800 text-white" : "text-zinc-500"
						}`}
					>
						Builder
					</button>
					<button
						onClick={() => setActiveTab("preview")}
						className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
							activeTab === "preview" ? "bg-zinc-800 text-white" : "text-zinc-500"
						}`}
					>
						Preview
					</button>
				</div>
			</div>

			<div className="max-w-[1920px] mx-auto">
				<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
					
					{/* Sidebar - Field Types (Visible always in builder tab, or sticky on left in large screens) */}
					<div className={`xl:col-span-2 ${activeTab === "builder" ? "block" : "hidden xl:block"}`}>
						<div className="sticky top-28 space-y-4">
							<div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
								<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
									Building Blocks
								</h3>
								<div className="grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2">
									{FIELD_TYPES.map(type => (
										<button
											key={type.value}
											onClick={() => addField(type.value)}
											className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all duration-200 group"
										>
											<Plus className="h-5 w-5 group-hover:scale-110 transition-transform text-zinc-500 group-hover:text-orange-500" />
											<span className="text-xs font-medium">{type.label.split(" ")[0]}</span>
										</button>
									))}
								</div>
							</div>
							
							{/* Live Preview Hint - Hide on XL as we show direct preview */}
							<div className="xl:hidden p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
								<div className="flex items-start gap-3">
									<div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
										<Eye className="h-4 w-4" />
									</div>
									<div>
										<h4 className="text-sm font-medium text-zinc-200">Live Preview</h4>
										<p className="text-xs text-zinc-500 mt-1">
											Switch to the Preview tab to see how your form looks to users.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content - Builder Settings & Canvas */}
					<div className={`xl:col-span-6 space-y-6 ${activeTab === "builder" ? "block" : "hidden xl:block"}`}>
						{/* Basic Settings */}
						<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
									<Settings className="h-4 w-4 text-white" />
								</div>
								<h2 className="text-lg font-semibold text-white">Basic Settings</h2>
							</div>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-400">Event Slug *</label>
									<input
										type="text"
										value={formConfig.eventSlug}
										onChange={(e) => setFormConfig(prev => ({ ...prev, eventSlug: e.target.value }))}
										placeholder="my-event-2024"
										className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
									/>
									<p className="text-xs text-zinc-500">Only lowercase letters, numbers, and hyphens</p>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-400">Event Title *</label>
									<input
										type="text"
										value={formConfig.eventTitle}
										onChange={(e) => setFormConfig(prev => ({ ...prev, eventTitle: e.target.value }))}
										placeholder="My Awesome Event"
										className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-400">Form Type</label>
									<select
										value={formConfig.formType}
										onChange={(e) => setFormConfig(prev => ({ ...prev, formType: e.target.value }))}
										className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
									>
										{FORM_TYPES.map(type => (
											<option key={type.value} value={type.value} className="bg-zinc-900">{type.label}</option>
										))}
									</select>
								</div>
								<div className="flex items-center justify-center">
									<label className="w-full flex items-center justify-between cursor-pointer p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 transition-colors group">
										<span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Form Active Status</span>
										<div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${formConfig.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
											<input
												type="checkbox"
												checked={formConfig.isActive}
												onChange={(e) => setFormConfig(prev => ({ ...prev, isActive: e.target.checked }))}
												className="sr-only"
											/>
											<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formConfig.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
										</div>
									</label>
								</div>
							</div>
						</div>

						{/* Payment Configuration */}
						{formConfig.formType === "payment" && (
							<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
								<div className="flex items-center gap-3 mb-6">
									<div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
										<span className="text-white text-sm font-bold">₹</span>
									</div>
									<h2 className="text-lg font-semibold text-white">Payment Configuration</h2>
								</div>
								<div className="space-y-6">
									<label className="w-full flex items-center justify-between cursor-pointer p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 transition-colors group">
										<span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Enable Payments</span>
										<div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${formConfig.paymentConfig.enabled ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
											<input
												type="checkbox"
												checked={formConfig.paymentConfig.enabled}
												onChange={(e) => setFormConfig(prev => ({
													...prev,
													paymentConfig: { ...prev.paymentConfig, enabled: e.target.checked }
												}))}
												className="sr-only"
											/>
											<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formConfig.paymentConfig.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
										</div>
									</label>

									{formConfig.paymentConfig.enabled && (
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-400">Amount (₹)</label>
												<input
													type="number"
													value={formConfig.paymentConfig.amount}
													onChange={(e) => setFormConfig(prev => ({
														...prev,
														paymentConfig: { ...prev.paymentConfig, amount: Number(e.target.value) }
													}))}
													className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
													placeholder="100"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-zinc-400">UPI ID</label>
												<input
													type="text"
													value={formConfig.paymentConfig.upiId}
													onChange={(e) => setFormConfig(prev => ({
														...prev,
														paymentConfig: { ...prev.paymentConfig, upiId: e.target.value }
													}))}
													placeholder="example@upi"
													className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
												/>
											</div>
											<div className="lg:col-span-2 space-y-2">
												<label className="text-sm font-medium text-zinc-400">QR Code URL</label>
												<input
													type="url"
													value={formConfig.paymentConfig.qrCodeUrl}
													onChange={(e) => setFormConfig(prev => ({
														...prev,
														paymentConfig: { ...prev.paymentConfig, qrCodeUrl: e.target.value }
													}))}
													placeholder="https://example.com/qr-code.png"
													className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200"
												/>
											</div>
											<div className="lg:col-span-2 space-y-2">
												<label className="text-sm font-medium text-zinc-400">Payment Instructions</label>
												<textarea
													value={formConfig.paymentConfig.instructions}
													onChange={(e) => setFormConfig(prev => ({
														...prev,
														paymentConfig: { ...prev.paymentConfig, instructions: e.target.value }
													}))}
													placeholder="Please scan the QR code and make the payment..."
													rows={3}
													className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all duration-200 resize-none"
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Form Fields */}
						<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
									<Settings className="h-4 w-4 text-white" />
								</div>
								<h2 className="text-lg font-semibold text-white">Form Fields</h2>
								<div className="ml-auto">
									<span className="px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-xs font-medium">
										{formConfig.fields.length} field{formConfig.fields.length !== 1 ? 's' : ''}
									</span>
								</div>
							</div>

							{formConfig.fields.length === 0 ? (
								<div className="text-center py-12 rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors bg-zinc-950/50">
									<div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-zinc-900 flex items-center justify-center">
										<Plus className="h-6 w-6 text-zinc-600" />
									</div>
									<h3 className="text-sm font-medium text-zinc-300 mb-1">Canvas is empty</h3>
									<p className="text-xs text-zinc-500">Pick a building block from the left to start</p>
								</div>
							) : (
								<div className="space-y-4">
									{formConfig.fields.map((field, index) => (
										<div
											key={field.id}
											className={`group rounded-xl border transition-all duration-200 overflow-hidden ${
												editingField === field.id
													? "border-orange-500/30 bg-zinc-900 shadow-lg shadow-orange-900/10"
													: "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
											}`}
										>
											<div className="p-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-medium font-mono">
															{String(index + 1).padStart(2, '0')}
														</div>
														<div>
															<h4 className="font-medium text-white text-sm">{field.label}</h4>
															<div className="flex items-center gap-2 mt-1">
																<span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-medium uppercase tracking-wider">
																	{field.type}
																</span>
																{field.required && (
																	<span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-medium uppercase tracking-wider">
																		Required
																	</span>
																)}
															</div>
														</div>
													</div>
													<div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
														<div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 mr-2">
															<button
																onClick={() => moveField(field.id, "up")}
																disabled={index === 0}
																className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
																title="Move up"
															>
																<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
																</svg>
															</button>
															<button
																onClick={() => moveField(field.id, "down")}
																disabled={index === formConfig.fields.length - 1}
																className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
																title="Move down"
															>
																<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
																</svg>
															</button>
														</div>
														
														<button
															onClick={() => setEditingField(editingField === field.id ? null : field.id)}
															className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
																editingField === field.id
																	? "bg-orange-500 text-white shadow-lg shadow-orange-900/20"
																	: "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
															}`}
														>
															{editingField === field.id ? "Done" : "Edit"}
														</button>
														<button
															onClick={() => deleteField(field.id)}
															className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
															title="Delete field"
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												</div>
											</div>
											{editingField === field.id && (
												<div className="border-t border-zinc-800/50 p-6 bg-zinc-950/30">
													<FieldEditor
														field={field}
														onUpdate={(updates) => updateField(field.id, updates)}
													/>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Live Preview Column (Visible in preview tab OR always on large screens) */}
					<div className={`xl:col-span-4 ${activeTab === "preview" ? "block" : "hidden xl:block"}`}>
						<div className="sticky top-28">
							<div className="hidden xl:flex items-center gap-2 mb-4">
								<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
								<span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Live Preview</span>
							</div>
							<div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
								<div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-2">
									<div className="flex gap-1.5">
										<div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
										<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
										<div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
									</div>
									<div className="mx-auto px-3 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500">
										Preview Mode
									</div>
								</div>
								<div className="max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
									<FormPreview formConfig={formConfig} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Submission Modal */}
			{showSubmissionModal && (
				<SubmissionModal
					formConfig={formConfig}
					onClose={() => setShowSubmissionModal(false)}
					onSuccess={() => {
						setShowSubmissionModal(false);
					}}
				/>
			)}
		</div>
	);
}