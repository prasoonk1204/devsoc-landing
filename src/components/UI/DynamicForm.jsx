"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

const DynamicForm = ({ eventSlug, onSuccess, onError }) => {
	const [formConfig, setFormConfig] = useState(null);
	const [formData, setFormData] = useState({});
	const [paymentScreenshot, setPaymentScreenshot] = useState(null);
	const [transactionId, setTransactionId] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		fetchFormConfig();
	}, [eventSlug]);

	const fetchFormConfig = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/v1/forms/${eventSlug}/config`);
			const result = await response.json();

			if (result.success) {
				setFormConfig(result.data);
				// Initialize form data with default values
				const initialData = {};
				result.data.fields.forEach((field) => {
					initialData[field.id] = field.type === "checkbox" ? [] : "";
				});
				setFormData(initialData);
			} else {
				onError?.(result.error || "Failed to load form configuration");
			}
		} catch (error) {
			onError?.(error.message || "Failed to load form configuration");
		} finally {
			setLoading(false);
		}
	};

	const validateField = (field, value) => {
		const validation = field.validation || {};

		if (field.required && (!value || value.toString().trim() === "")) {
			return `${field.label} is required`;
		}

		if (value && validation.minLength && value.length < validation.minLength) {
			return `${field.label} must be at least ${validation.minLength} characters`;
		}

		if (value && validation.maxLength && value.length > validation.maxLength) {
			return `${field.label} must be no more than ${validation.maxLength} characters`;
		}

		if (
			value &&
			validation.pattern &&
			!new RegExp(validation.pattern).test(value)
		) {
			return `${field.label} format is invalid`;
		}

		if (
			field.type === "email" &&
			value &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
		) {
			return "Please enter a valid email address";
		}

		if (field.type === "tel" && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
			return "Please enter a valid phone number";
		}

		return null;
	};

	const handleInputChange = (fieldId, value) => {
		setFormData((prev) => ({ ...prev, [fieldId]: value }));

		// Clear error for this field
		if (errors[fieldId]) {
			setErrors((prev) => ({ ...prev, [fieldId]: null }));
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file size (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				setErrors((prev) => ({
					...prev,
					paymentScreenshot: "File size must be less than 5MB",
				}));
				return;
			}

			// Validate file type
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/webp",
			];
			if (!allowedTypes.includes(file.type)) {
				setErrors((prev) => ({
					...prev,
					paymentScreenshot: "Only JPEG, PNG, and WebP images are allowed",
				}));
				return;
			}

			setPaymentScreenshot(file);
			setErrors((prev) => ({ ...prev, paymentScreenshot: null }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		// Validate all fields
		formConfig.fields.forEach((field) => {
			const error = validateField(field, formData[field.id]);
			if (error) {
				newErrors[field.id] = error;
			}
		});

		// Validate payment fields if payment is enabled
		if (formConfig.paymentConfig?.enabled) {
			if (!transactionId.trim()) {
				newErrors.transactionId = "Transaction ID is required";
			}
			if (!paymentScreenshot) {
				newErrors.paymentScreenshot = "Payment screenshot is required";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setSubmitting(true);

		try {
			const submitData = new FormData();

			// Create a copy of form data without file fields for JSON
			const jsonFormData = { ...formData };

			// Handle file uploads
			formConfig.fields.forEach((field) => {
				if (field.type === "file" && formData[field.id]) {
					const file = formData[field.id];
					if (file instanceof File) {
						submitData.append(`file_${field.id}`, file);
						// Remove file from JSON data
						delete jsonFormData[field.id];
					}
				}
			});

			submitData.append("formData", JSON.stringify(jsonFormData));

			if (formConfig.paymentConfig?.enabled) {
				if (transactionId.trim()) {
					submitData.append("transactionId", transactionId.trim());
				}
				if (paymentScreenshot) {
					submitData.append("paymentScreenshot", paymentScreenshot);
				}
			}

			const response = await fetch(`/api/v1/forms/${eventSlug}/submit`, {
				method: "POST",
				body: submitData,
			});

			const result = await response.json();

			if (result.success) {
				onSuccess?.(result.message || "Registration successful!");
			} else {
				onError?.(result.error || "Registration failed");
			}
		} catch (error) {
			onError?.(error.message || "Registration failed");
		} finally {
			setSubmitting(false);
		}
	};

	const renderField = (field) => {
		const commonProps = {
			id: field.id,
			className: `w-full px-4 py-3 rounded-lg border ${
				errors[field.id] ? "border-red-500" : "border-gray-300"
			} focus:border-blue-500 focus:outline-none transition-colors ${
				formConfig.styling?.theme === "dark"
					? "bg-gray-800 text-white"
					: "bg-white text-gray-900"
			}`,
			placeholder: field.placeholder,
			required: field.required,
		};

		switch (field.type) {
			case "text":
			case "email":
			case "tel":
				return (
					<input
						{...commonProps}
						type={field.type}
						value={formData[field.id] || ""}
						onChange={(e) => handleInputChange(field.id, e.target.value)}
					/>
				);

			case "textarea":
				return (
					<textarea
						{...commonProps}
						rows={4}
						value={formData[field.id] || ""}
						onChange={(e) => handleInputChange(field.id, e.target.value)}
					/>
				);

			case "select":
				return (
					<select
						{...commonProps}
						value={formData[field.id] || ""}
						onChange={(e) => handleInputChange(field.id, e.target.value)}
					>
						<option value="">Select {field.label}</option>
						{field.options?.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				);

			case "radio":
				return (
					<div className="space-y-2">
						{field.options?.map((option) => (
							<label key={option} className="flex items-center space-x-2">
								<input
									type="radio"
									name={field.id}
									value={option}
									checked={formData[field.id] === option}
									onChange={(e) => handleInputChange(field.id, e.target.value)}
									className="text-blue-600"
								/>
								<span
									className={
										formConfig.styling?.theme === "dark"
											? "text-white"
											: "text-gray-900"
									}
								>
									{option}
								</span>
							</label>
						))}
					</div>
				);

			case "checkbox":
				return (
					<div className="space-y-2">
						{field.options?.map((option) => (
							<label key={option} className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={(formData[field.id] || []).includes(option)}
									onChange={(e) => {
										const currentValues = formData[field.id] || [];
										const newValues = e.target.checked
											? [...currentValues, option]
											: currentValues.filter((v) => v !== option);
										handleInputChange(field.id, newValues);
									}}
									className="text-blue-600"
								/>
								<span
									className={
										formConfig.styling?.theme === "dark"
											? "text-white"
											: "text-gray-900"
									}
								>
									{option}
								</span>
							</label>
						))}
					</div>
				);

			case "file":
				return (
					<input
						{...commonProps}
						type="file"
						accept={field.validation?.fileTypes?.join(",") || "*/*"}
						onChange={(e) => {
							const file = e.target.files[0];
							if (file) {
								// Validate file size if specified
								const maxSize =
									field.validation?.maxFileSize || 5 * 1024 * 1024;
								if (file.size > maxSize) {
									setErrors((prev) => ({
										...prev,
										[field.id]: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
									}));
									return;
								}

								// Validate file type if specified
								const allowedTypes = field.validation?.fileTypes;
								if (allowedTypes && !allowedTypes.includes(file.type)) {
									setErrors((prev) => ({
										...prev,
										[field.id]: `File type must be one of: ${allowedTypes.join(", ")}`,
									}));
									return;
								}

								handleInputChange(field.id, file);
								setErrors((prev) => ({ ...prev, [field.id]: null }));
							}
						}}
						className={`${commonProps.className} file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100`}
					/>
				);

			case "number":
				return (
					<input
						{...commonProps}
						type="number"
						min={field.validation?.min}
						max={field.validation?.max}
						value={formData[field.id] || ""}
						onChange={(e) => handleInputChange(field.id, e.target.value)}
					/>
				);

			case "date":
				return (
					<input
						{...commonProps}
						type="date"
						value={formData[field.id] || ""}
						onChange={(e) => handleInputChange(field.id, e.target.value)}
					/>
				);

			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!formConfig) {
		return (
			<div className="p-8 text-center">
				<p className="text-red-600">Form configuration not found</p>
			</div>
		);
	}

	const theme = formConfig.styling?.theme || "light";
	const isDark = theme === "dark";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={`mx-auto max-w-2xl rounded-lg p-6 ${
				isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
			}`}
			style={{
				backgroundColor: formConfig.styling?.backgroundColor,
				color: formConfig.styling?.primaryColor,
			}}
		>
			<div className="mb-6">
				<h2 className="mb-2 text-2xl font-bold">{formConfig.eventTitle}</h2>
				<p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
					Please fill out the form below to register for this event.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{formConfig.fields.map((field) => (
					<div key={field.id}>
						<label
							htmlFor={field.id}
							className={`mb-2 block text-sm font-medium ${
								isDark ? "text-gray-200" : "text-gray-700"
							}`}
						>
							{field.label}
							{field.required && <span className="ml-1 text-red-500">*</span>}
						</label>
						{renderField(field)}
						{errors[field.id] && (
							<p className="mt-1 text-sm text-red-500">{errors[field.id]}</p>
						)}
					</div>
				))}

				{formConfig.paymentConfig?.enabled && (
					<div
						className={`border-t pt-6 ${isDark ? "border-gray-700" : "border-gray-200"}`}
					>
						<h3 className="mb-4 text-lg font-semibold">Payment Information</h3>

						{formConfig.paymentConfig.qrCodeUrl && (
							<div className="mb-4 text-center">
								<img
									src={formConfig.paymentConfig.qrCodeUrl}
									alt="Payment QR Code"
									className="mx-auto max-w-xs rounded-lg"
								/>
								{formConfig.paymentConfig.upiId && (
									<p
										className={`mt-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
									>
										UPI ID: {formConfig.paymentConfig.upiId}
									</p>
								)}
							</div>
						)}

						{formConfig.paymentConfig.instructions && (
							<div
								className={`mb-4 rounded-lg p-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
							>
								<p className="text-sm">
									{formConfig.paymentConfig.instructions}
								</p>
							</div>
						)}

						<div className="mb-4">
							<p className="text-lg font-semibold">
								Amount: ₹{formConfig.paymentConfig.amount}
							</p>
						</div>

						<div className="space-y-4">
							<div>
								<label
									className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
								>
									Transaction ID <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={transactionId}
									onChange={(e) => setTransactionId(e.target.value)}
									className={`w-full rounded-lg border px-4 py-3 ${
										errors.transactionId ? "border-red-500" : "border-gray-300"
									} transition-colors focus:border-blue-500 focus:outline-none ${
										isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
									}`}
									placeholder="Enter your transaction ID"
								/>
								{errors.transactionId && (
									<p className="mt-1 text-sm text-red-500">
										{errors.transactionId}
									</p>
								)}
							</div>

							<div>
								<label
									className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
								>
									Payment Screenshot <span className="text-red-500">*</span>
								</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className={`w-full rounded-lg border px-4 py-3 ${
										errors.paymentScreenshot
											? "border-red-500"
											: "border-gray-300"
									} transition-colors focus:border-blue-500 focus:outline-none ${
										isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
									}`}
								/>
								{errors.paymentScreenshot && (
									<p className="mt-1 text-sm text-red-500">
										{errors.paymentScreenshot}
									</p>
								)}
							</div>
						</div>
					</div>
				)}

				<button
					type="submit"
					disabled={submitting}
					className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
						submitting
							? "cursor-not-allowed bg-gray-400"
							: "bg-blue-600 text-white hover:bg-blue-700"
					}`}
					style={{
						backgroundColor: !submitting
							? formConfig.styling?.primaryColor
							: undefined,
					}}
				>
					{submitting ? "Submitting..." : "Submit Registration"}
				</button>
			</form>
		</motion.div>
	);
};

export default DynamicForm;
