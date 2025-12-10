#!/usr/bin/env node

/**
 * Simple test script for the Dynamic Forms API
 * Usage: node test-api.js
 */

const BASE_URL = "http://localhost:3001/api/v1"; // Updated to match server port
const ADMIN_SECRET =
	process.env.ADMIN_SECRET ||
	"0affca21ee0b538cc563f31a1e599314ad84286912f02df7f939ab2b278e8dfb";

async function testAPI() {
	console.log("🚀 Testing Dynamic Forms API...\n");

	try {
		// Test 1: Health Check
		console.log("1. Testing Health Check...");
		const healthResponse = await fetch(`${BASE_URL}/health`);
		const healthData = await healthResponse.json();
		console.log("✅ Health Check:", healthData.status);
		console.log("");

		// Test 2: Create Form Configuration
		console.log("2. Creating Form Configuration...");
		const formConfig = {
			eventSlug: "test-event-" + Date.now(),
			eventTitle: "Test Event",
			formType: "simple",
			isActive: true,
			fields: [
				{
					id: "name",
					type: "text",
					label: "Full Name",
					placeholder: "Enter your full name",
					required: true,
					validation: {
						minLength: 2,
						maxLength: 100,
					},
				},
				{
					id: "email",
					type: "email",
					label: "Email Address",
					placeholder: "your.email@example.com",
					required: true,
				},
				{
					id: "experience",
					type: "select",
					label: "Experience Level",
					required: true,
					options: ["Beginner", "Intermediate", "Advanced"],
				},
			],
			styling: {
				theme: "light",
				primaryColor: "#3B82F6",
				backgroundColor: "#FFFFFF",
			},
		};

		const createResponse = await fetch(`${BASE_URL}/forms/admin/config`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Admin-Secret": ADMIN_SECRET,
			},
			body: JSON.stringify(formConfig),
		});

		const createData = await createResponse.json();

		if (createData.success) {
			console.log("✅ Form Created:", createData.data.eventSlug);

			// Test 3: Get Form Configuration
			console.log("\n3. Getting Form Configuration...");
			const getResponse = await fetch(
				`${BASE_URL}/forms/${createData.data.eventSlug}/config`,
			);
			const getData = await getResponse.json();

			if (getData.success) {
				console.log("✅ Form Retrieved:", getData.data.eventTitle);
				console.log("   Fields:", getData.data.fields.length);

				// Test 4: Submit Form
				console.log("\n4. Submitting Form...");
				const formData = new FormData();
				formData.append(
					"formData",
					JSON.stringify({
						name: "John Doe",
						email: "john.doe@example.com",
						experience: "Intermediate",
					}),
				);

				const submitResponse = await fetch(
					`${BASE_URL}/forms/${createData.data.eventSlug}/submit`,
					{
						method: "POST",
						body: formData,
					},
				);

				const submitData = await submitResponse.json();

				if (submitData.success) {
					console.log("✅ Form Submitted:", submitData.message);
				} else {
					console.log("❌ Form Submission Failed:", submitData.error);
				}

				// Test 5: Get All Configurations (Admin)
				console.log("\n5. Getting All Configurations...");
				const allConfigsResponse = await fetch(
					`${BASE_URL}/forms/admin/configs`,
					{
						headers: {
							"X-Admin-Secret": ADMIN_SECRET,
						},
					},
				);

				const allConfigsData = await allConfigsResponse.json();

				if (allConfigsData.success) {
					console.log(
						"✅ All Configurations Retrieved:",
						allConfigsData.count,
						"forms",
					);
				} else {
					console.log("❌ Failed to get configurations:", allConfigsData.error);
				}

				// Test 6: Delete Form (cleanup)
				console.log("\n6. Cleaning up (deleting test form)...");
				const deleteResponse = await fetch(
					`${BASE_URL}/forms/admin/${createData.data.eventSlug}`,
					{
						method: "DELETE",
						headers: {
							"X-Admin-Secret": ADMIN_SECRET,
						},
					},
				);

				const deleteData = await deleteResponse.json();

				if (deleteData.success) {
					console.log("✅ Form Deleted:", deleteData.data.eventSlug);
				} else {
					console.log("❌ Failed to delete form:", deleteData.error);
				}
			} else {
				console.log("❌ Failed to get form:", getData.error);
			}
		} else {
			console.log("❌ Failed to create form:", createData.error);
			if (createData.details) {
				console.log("   Validation errors:", createData.details);
			}
		}

		console.log("\n🎉 API Test Complete!");
	} catch (error) {
		console.error("❌ Test failed with error:", error.message);
		console.log("\n💡 Make sure:");
		console.log("   - Server is running on http://localhost:3001");
		console.log("   - ADMIN_SECRET is set correctly in this script");
		console.log("   - Database (Convex) is connected");
	}
}

// Run the test
testAPI();
