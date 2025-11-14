"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeInBlur } from "@/lib/motionVariants";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { registrationSchema } from "@/lib/validations/registration";
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

	const registerUser = useMutation(api.registrations.registerUser);

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
		setIsSubmitting(true);
		setErrors({});
		setSubmitStatus(null);

		try {
			const validatedData = registrationSchema.parse(formData);

			setUploadProgress("Uploading payment screenshot...");

			const uploadFormData = new FormData();
			uploadFormData.append("file", validatedData.paymentScreenshot);
			uploadFormData.append("eventSlug", event.slug);

			const uploadResponse = await fetch("/api/upload-payment-screenshot", {
				method: "POST",
				body: uploadFormData,
			});

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json();
				throw new Error(
					errorData.error || "Failed to upload payment screenshot",
				);
			}

			setUploadProgress("Payment screenshot uploaded successfully!");

			const { data: uploadData } = await uploadResponse.json();

			setUploadProgress("Saving registration details...");

			const result = await registerUser({
				name: validatedData.name,
				roll: validatedData.roll,
				phone: validatedData.phone,
				email: validatedData.email,
				department: validatedData.department,
				year: validatedData.year,
				questions: validatedData.questions,
				eventSlug: event.slug,
				eventTitle: event.title,
				transactionId: validatedData.transactionId,
				paymentScreenshotUrl: uploadData.url,
				paymentScreenshotStorageId: uploadData.fileId,
				amount: 50,
			});

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
			console.error("Registration error:", error);

			if (error.errors) {
				const fieldErrors = {};
				error.errors.forEach((err) => {
					fieldErrors[err.path[0]] = err.message;
				});
				setErrors(fieldErrors);
				setSubmitStatus({
					type: "error",
					message: "Please fix the errors in the form",
				});
			} else {
				setSubmitStatus({
					type: "error",
					message:
						error.message || "Failed to submit registration. Please try again.",
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

				<PaymentQRCode />

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
					<StatusMessage type={submitStatus.type} message={submitStatus.message} />
				)}

				<button
					type="submit"
					disabled={isSubmitting}
					className="bg-accent hover:bg-accent/90 focus:ring-accent w-full rounded-lg px-6 py-3 font-medium text-black transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSubmitting ? "Submitting..." : "Submit"}
				</button>
			</form>
		</motion.div>
	);
}
