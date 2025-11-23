"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import { registrationSchema } from "@/lib/validations/registration";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import FormInput from "./Registration/FormInput";
import FormSelect from "./Registration/FormSelect";
import FormTextarea from "./Registration/FormTextarea";
import FileUpload from "./Registration/FileUpload";
import PaymentQRCode from "./Registration/PaymentQRCode";
import StatusMessage from "./Registration/StatusMessage";
import { formatEventDate } from "@/lib/utils/eventUtils";

const DEPARTMENTS = [
	{ value: "CSE", label: "Computer Science Engineering" },
	{ value: "ECE", label: "Electronics & Communication Engineering" },
	{ value: "EEE", label: "Electrical & Electronics Engineering" },
	{ value: "ME", label: "Mechanical Engineering" },
	{ value: "CE", label: "Civil Engineering" },
	{ value: "IT", label: "Information Technology" },
	{ value: "Other", label: "Other" },
];

const YEARS = [
	{ value: "1st Year", label: "1st Year" },
	{ value: "2nd Year", label: "2nd Year" },
	{ value: "3rd Year", label: "3rd Year" },
	{ value: "4th Year", label: "4th Year" },
];

export default function EventRegistrationForm({ event }) {
	const [formData, setFormData] = useState({
		name: "",
		roll: "",
		phone: "",
		email: "",
		department: "",
		year: "",
		questions: "",
		transactionId: "",
		paymentScreenshot: null,
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(null);
	const [errors, setErrors] = useState({});
	const [submitStatus, setSubmitStatus] = useState(null);
	const [fileInfo, setFileInfo] = useState(null);

	// Check if email is already registered for this event
	const emailCheck = useQuery(
		api.registrations.checkEmailRegistration,
		formData.email && formData.email.length >= 5
			? { email: formData.email.toLowerCase(), eventSlug: event.slug }
			: "skip",
	);

	// Fetch payment settings for this event
	const paymentSettings = useQuery(api.settings.getPaymentSettings, {
		eventSlug: event.slug,
	});

	useEffect(() => {
		if (emailCheck?.isRegistered) {
			setErrors((prev) => ({
				...prev,
				email: `This email is already registered for ${event.title}. Each email can only register once per event.`,
			}));
		} else if (errors.email?.includes("already registered")) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.email;
				return newErrors;
			});
		}
	}, [emailCheck, event.title]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];

		if (file) {
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				setErrors((prev) => ({
					...prev,
					paymentScreenshot: `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 5MB.`,
				}));
				e.target.value = "";
				return;
			}

			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/webp",
			];
			if (!allowedTypes.includes(file.type)) {
				setErrors((prev) => ({
					...prev,
					paymentScreenshot: "Only JPEG, PNG, and WebP images are allowed.",
				}));
				e.target.value = "";
				return;
			}

			setFormData((prev) => ({
				...prev,
				paymentScreenshot: file,
			}));

			setFileInfo({
				name: file.name,
				size: (file.size / (1024 * 1024)).toFixed(2),
			});

			if (errors.paymentScreenshot) {
				setErrors((prev) => ({ ...prev, paymentScreenshot: null }));
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (emailCheck?.isRegistered) {
			setSubmitStatus({
				type: "error",
				message: `This email is already registered for ${event.title}. Please use a different email address.`,
			});
			return;
		}

		setIsSubmitting(true);
		setErrors({});
		setSubmitStatus(null);

		try {
			const validatedData = registrationSchema.parse(formData);

			setUploadProgress("Submitting registration...");

			const registrationFormData = new FormData();
			registrationFormData.append("name", validatedData.name);
			registrationFormData.append("roll", validatedData.roll);
			registrationFormData.append("phone", validatedData.phone);
			registrationFormData.append("email", validatedData.email);
			registrationFormData.append("department", validatedData.department);
			registrationFormData.append("year", validatedData.year);
			registrationFormData.append("questions", validatedData.questions);
			registrationFormData.append("eventSlug", event.slug);
			registrationFormData.append("eventTitle", event.title);
			registrationFormData.append("transactionId", validatedData.transactionId);
			registrationFormData.append(
				"amount",
				String(paymentSettings?.amount || 50),
			);
			registrationFormData.append("file", validatedData.paymentScreenshot);

			const response = await fetch("/api/register-event", {
				method: "POST",
				body: registrationFormData,
			});

			const result = await response.json();

			if (!response.ok) {
				const errorMessage = result.error || "Failed to submit registration";

				if (errorMessage.includes("already registered")) {
					throw new Error(
						`You have already registered for ${event.title} with this email. Each email can only register once per event.`,
					);
				} else if (errorMessage.includes("transaction ID")) {
					throw new Error(
						"This transaction ID has already been used. Please check your transaction ID or use a different one.",
					);
				} else {
					throw new Error(errorMessage);
				}
			}

			setUploadProgress(null);
			setSubmitStatus({
				type: "success",
				message: result.message,
			});

			setFormData({
				name: "",
				roll: "",
				phone: "",
				email: "",
				department: "",
				year: "",
				questions: "",
				transactionId: "",
				paymentScreenshot: null,
			});

			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";
			setFileInfo(null);
		} catch (error) {
			// console.error("Registration error:", error);

			if (error.errors) {
				const fieldErrors = {};
				error.errors.forEach((err) => {
					fieldErrors[err.path[0]] = err.message;
				});
				setErrors(fieldErrors);
				setSubmitStatus({
					type: "error",
					message: "Please fix the errors in the form and try again.",
				});
			} else {
				let userMessage =
					"We're having trouble processing your registration. Please try again.";

				if (error.message) {
					const errorMsg = error.message.toLowerCase();

					if (
						errorMsg.includes("already registered") ||
						errorMsg.includes("transaction id") ||
						errorMsg.includes("email") ||
						errorMsg.includes("rate limit") ||
						errorMsg.includes("too many")
					) {
						userMessage = error.message;
					} else if (
						errorMsg.includes("network") ||
						errorMsg.includes("fetch")
					) {
						userMessage =
							"Network error. Please check your internet connection and try again.";
					}
				}

				setSubmitStatus({
					type: "error",
					message: userMessage,
				});
			}
		} finally {
			setIsSubmitting(false);
			setUploadProgress(null);
		}
	};

	return (
		<motion.div
			variants={fadeInBlur}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			className="mx-auto max-w-2xl rounded-3xl border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-sm sm:p-6 md:p-8"
		>
			<div className="mb-6 text-center sm:mb-8">
				<h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
					Event Registration
				</h2>
				<p className="text-sm text-neutral-400 sm:text-base">
					Register for {event.title} - {formatEventDate(event.date)}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
				<FormInput
					label="What's your name"
					name="name"
					value={formData.name}
					onChange={handleInputChange}
					required
					placeholder="Enter your full name"
					error={errors.name}
				/>

				<FormInput
					label="Enter your Roll"
					name="roll"
					value={formData.roll}
					onChange={handleInputChange}
					required
					placeholder="Enter your roll number"
					error={errors.roll}
				/>

				<FormInput
					label="Enter your Phone No."
					name="phone"
					type="tel"
					value={formData.phone}
					onChange={handleInputChange}
					required
					placeholder="Enter your phone number"
					error={errors.phone}
				/>

				<FormInput
					label="Enter your Email ID"
					name="email"
					type="email"
					value={formData.email}
					onChange={handleInputChange}
					required
					placeholder="Enter your email address"
					error={errors.email}
				/>

				<FormSelect
					label="What is your Dept?"
					name="department"
					value={formData.department}
					onChange={handleInputChange}
					required
					options={DEPARTMENTS}
					placeholder="Select your department"
					error={errors.department}
				/>

				<FormSelect
					label="What is your Year?"
					name="year"
					value={formData.year}
					onChange={handleInputChange}
					required
					options={YEARS}
					placeholder="Select your year"
					error={errors.year}
				/>

				<FormTextarea
					label="Any questions? (If none, write N/A)"
					name="questions"
					value={formData.questions}
					onChange={handleInputChange}
					required
					placeholder="Please share any questions or special requirements"
					error={errors.questions}
				/>

				<PaymentQRCode eventSlug={event.slug} />

				<FormInput
					label="Enter Transaction ID"
					name="transactionId"
					value={formData.transactionId}
					onChange={handleInputChange}
					required
					placeholder="Enter your transaction ID"
					error={errors.transactionId}
				/>

				<FileUpload
					label="Enter the Payment Screenshot"
					name="paymentScreenshot"
					onChange={handleFileChange}
					required
					accept="image/jpeg,image/jpg,image/png,image/webp"
					error={errors.paymentScreenshot}
					fileInfo={fileInfo}
					helpText="Size limit: 5 MB | Formats: JPEG, PNG, WebP"
				/>

				{uploadProgress && (
					<StatusMessage type="progress" message={uploadProgress} />
				)}

				{submitStatus && (
					<StatusMessage
						type={submitStatus.type}
						message={submitStatus.message}
					/>
				)}

				<button
					type="submit"
					disabled={isSubmitting || emailCheck?.isRegistered}
					className="bg-accent hover:bg-accent/90 focus:ring-accent w-full rounded-lg px-6 py-3 font-medium text-black transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSubmitting
						? "Submitting..."
						: emailCheck?.isRegistered
							? "Email Already Registered"
							: "Submit"}
				</button>
			</form>
		</motion.div>
	);
}
