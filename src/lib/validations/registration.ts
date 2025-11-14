import { z } from "zod";

export const registrationSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be less than 100 characters")
		.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

	roll: z
		.string()
		.min(3, "Roll number must be at least 3 characters")
		.max(20, "Roll number must be less than 20 characters")
		.regex(
			/^[a-zA-Z0-9]+$/,
			"Roll number can only contain letters and numbers",
		),

	phone: z
		.string()
		.min(10, "Phone number must be at least 10 digits")
		.max(15, "Phone number must be less than 15 digits")
		.regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),

	email: z
		.string()
		.email("Invalid email address")
		.min(5, "Email must be at least 5 characters")
		.max(100, "Email must be less than 100 characters")
		.toLowerCase(),

	department: z
		.string()
		.min(2, "Please select a department")
		.max(50, "Department name is too long"),

	year: z
		.string()
		.min(1, "Please select your year")
		.max(20, "Year is too long"),

	questions: z
		.string()
		.min(1, "Please provide an answer or write 'None'")
		.max(1000, "Questions must be less than 1000 characters"),

	transactionId: z
		.string()
		.min(5, "Transaction ID must be at least 5 characters")
		.max(100, "Transaction ID must be less than 100 characters")
		.regex(
			/^[a-zA-Z0-9]+$/,
			"Transaction ID can only contain letters and numbers",
		),

	paymentScreenshot: z
		.instanceof(File)
		.refine((file) => file.size > 0, "Payment screenshot is required")
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"File size must be less than 5MB",
		)
		.refine(
			(file) =>
				["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
					file.type,
				),
			"Only JPEG, PNG, and WebP images are allowed",
		),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
