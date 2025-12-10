"use client";

export default function FormPreview({ formConfig }) {
	const renderField = (field) => {
		const baseClasses = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none";
		
		switch (field.type) {
			case "text":
			case "email":
			case "tel":
			case "number":
			case "date":
				return (
					<input
						type={field.type}
						placeholder={field.placeholder}
						className={baseClasses}
						disabled
					/>
				);
			
			case "textarea":
				return (
					<textarea
						placeholder={field.placeholder}
						rows={4}
						className={baseClasses}
						disabled
					/>
				);
			
			case "select":
				return (
					<select className={baseClasses} disabled>
						<option value="">Select an option</option>
						{field.options?.map((option, index) => (
							<option key={index} value={option}>
								{option}
							</option>
						))}
					</select>
				);
			
			case "radio":
				return (
					<div className="space-y-2">
						{field.options?.map((option, index) => (
							<label key={index} className="flex items-center">
								<input
									type="radio"
									name={field.id}
									value={option}
									className="mr-2"
									disabled
								/>
								<span>{option}</span>
							</label>
						))}
					</div>
				);
			
			case "checkbox":
				return (
					<div className="space-y-2">
						{field.options?.map((option, index) => (
							<label key={index} className="flex items-center">
								<input
									type="checkbox"
									value={option}
									className="mr-2"
									disabled
								/>
								<span>{option}</span>
							</label>
						))}
					</div>
				);
			
			case "file":
				return (
					<input
						type="file"
						className={baseClasses}
						disabled
					/>
				);
			
			default:
				return (
					<input
						type="text"
						placeholder={field.placeholder}
						className={baseClasses}
						disabled
					/>
				);
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 mb-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
						<span className="text-white text-xs font-bold">👁</span>
					</div>
					<h2 className="text-xl font-semibold text-white">Form Preview</h2>
				</div>
				<p className="text-zinc-400 text-sm">This is how your form will appear to users</p>
			</div>
			<div className="rounded-2xl bg-white shadow-2xl p-6 sm:p-8 lg:p-10">
				{/* Form Header */}
				{/* Form Header */}
				<div className="mb-8 border-b border-gray-100 pb-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 tracking-tight">
								{formConfig.eventTitle || "Event Title"}
							</h1>
							<p className="mt-1 text-gray-500 font-medium">
								{formConfig.eventSlug || "event-slug"}
							</p>
						</div>
						
						<div className="flex items-center gap-2">
							<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
								formConfig.isActive 
									? "bg-emerald-100 text-emerald-700" 
									: "bg-red-100 text-red-700"
							}`}>
								<span className={`h-1.5 w-1.5 rounded-full ${formConfig.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
								{formConfig.isActive ? "Active" : "Inactive"}
							</span>
							<span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
								{formConfig.formType}
							</span>
						</div>
					</div>
				</div>

				{/* Payment Info */}
				{formConfig.formType === "payment" && formConfig.paymentConfig?.enabled && (
					<div className="mb-6 rounded-lg bg-yellow-50 p-4 sm:mb-8 sm:p-6">
						<h3 className="mb-2 text-lg font-semibold text-yellow-800">Payment Required</h3>
						<p className="mb-2 text-yellow-700">
							Amount: ₹{formConfig.paymentConfig.amount}
						</p>
						{formConfig.paymentConfig.upiId && (
							<p className="mb-2 text-yellow-700">
								UPI ID: {formConfig.paymentConfig.upiId}
							</p>
						)}
						{formConfig.paymentConfig.instructions && (
							<p className="text-sm text-yellow-600">
								{formConfig.paymentConfig.instructions}
							</p>
						)}
					</div>
				)}

				{/* Form Fields */}
				{formConfig.fields.length === 0 ? (
					<div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center sm:p-8">
						<p className="text-gray-500">No fields added yet</p>
					</div>
				) : (
					<form className="space-y-4 sm:space-y-6">
						{formConfig.fields.map((field) => (
							<div key={field.id}>
								<label className="mb-2 block text-sm font-medium text-gray-700">
									{field.label}
									{field.required && <span className="text-red-500"> *</span>}
								</label>
								{renderField(field)}
								{field.validation && (
									<div className="mt-1 text-xs text-gray-500">
										{field.validation.minLength && `Min length: ${field.validation.minLength}`}
										{field.validation.maxLength && ` Max length: ${field.validation.maxLength}`}
										{field.validation.min && `Min value: ${field.validation.min}`}
										{field.validation.max && ` Max value: ${field.validation.max}`}
										{field.validation.maxFileSize && `Max file size: ${Math.round(field.validation.maxFileSize / (1024 * 1024))}MB`}
										{field.validation.fileTypes && ` Allowed types: ${field.validation.fileTypes.join(", ")}`}
									</div>
								)}
							</div>
						))}

						{/* Payment Screenshot Upload (for payment forms) */}
						{formConfig.formType === "payment" && formConfig.paymentConfig?.enabled && (
							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700">
									Payment Screenshot *
								</label>
								<input
									type="file"
									accept="image/*"
									className="w-full rounded-lg border border-gray-300 px-3 py-2"
									disabled
								/>
							</div>
						)}

						<button
							type="button"
							className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
							disabled
						>
							Submit Registration
						</button>
					</form>
				)}
			</div>
		</div>
	);
}