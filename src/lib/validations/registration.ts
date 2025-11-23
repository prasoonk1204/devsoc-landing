import { z } from "zod";

export const registrationSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be less than 100 characters")
		.regex(
			/^[a-zA-Z\s.'-]+$/,
			"Name can only contain letters, spaces, and common punctuation (. ' -)",
		)
		.transform((val) => val.trim()),

	roll: z
		.string()
		.min(1, "Roll number is required")
		.min(3, "Roll number must be at least 3 characters")
		.max(20, "Roll number must be less than 20 characters")
		.regex(
			/^[a-zA-Z0-9/-]+$/,
			"Roll number can only contain letters, numbers, hyphens, and slashes",
		)
		.transform((val) => val.trim().toUpperCase()),

	phone: z
		.string()
		.min(1, "Phone number is required")
		.min(10, "Phone number must be at least 10 digits")
		.max(15, "Phone number must be less than 15 digits")
		.regex(
			/^[0-9+\-\s()]+$/,
			"Phone number can only contain digits, +, -, spaces, and parentheses",
		)
		.refine(
			(val) => val.replace(/[^0-9]/g, "").length >= 10,
			"Phone number must contain at least 10 digits",
		)
		.transform((val) => val.trim()),

	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address (e.g., name@example.com)")
		.min(5, "Email must be at least 5 characters")
		.max(100, "Email must be less than 100 characters")
		.toLowerCase()
		.transform((val) => val.trim()),

	department: z
		.string()
		.min(1, "Please select your department")
		.max(50, "Department name is too long"),

	year: z
		.string()
		.min(1, "Please select your year")
		.max(20, "Year is too long"),

	questions: z
		.string()
		.min(
			1,
			"This field is required. Write 'N/A' or 'None' if you have no questions",
		)
		.max(1000, "Response must be less than 1000 characters")
		.transform((val) => val.trim()),

	transactionId: z
		.string()
		.min(1, "Transaction ID is required")
		.min(5, "Transaction ID must be at least 5 characters")
		.max(100, "Transaction ID must be less than 100 characters")
		.regex(
			/^[a-zA-Z0-9]+$/,
			"Transaction ID can only contain letters and numbers (no spaces or special characters)",
		)
		.transform((val) => val.trim().toUpperCase()),

	paymentScreenshot: z
		.instanceof(File)
		.refine((file) => file.size > 0, "Payment screenshot is required")
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"File size must be less than 5MB. Please compress your image and try again.",
		)
		.refine(
			(file) =>
				["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
					file.type,
				),
			"Only JPEG, PNG, and WebP images are allowed. Please convert your file and try again.",
		),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
