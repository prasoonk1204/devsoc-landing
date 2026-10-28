export async function apiRequest(
	path,
	{ method = "GET", body, ...options } = {},
) {
	const response = await fetch(`/api/v1/${path}`, {
		method,
		credentials: "same-origin",
		cache: "no-store",
		headers: { "Content-Type": "application/json" },
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
		...options,
	});
	const value = await response.json();
	if (!response.ok)
		throw new Error(
			value.details
				?.map((issue) => `${issue.path}: ${issue.message}`)
				.join("; ") ||
				value.error ||
				"Request failed",
		);
	return value.data ?? value;
}
export async function uploadImage(
	file,
	{ ownerKind, ownerId, slot, registration },
	onProgress = () => {},
) {
	onProgress("Authorizing upload...");
	const publicUpload = ownerKind === "registrations";
	const base = publicUpload ? "registrations/upload" : "admin/media/upload";
	const prepared = await apiRequest(base, {
		method: "POST",
		body: publicUpload
			? { registration, name: file.name, size: file.size, type: file.type }
			: {
					ownerKind,
					ownerId,
					slot,
					name: file.name,
					size: file.size,
					type: file.type,
				},
	});
	const form = new FormData();
	for (const [key, value] of Object.entries(prepared.fields))
		form.append(key, String(value));
	form.append("file", file);
	onProgress("Uploading image...");
	const uploaded = await fetch(prepared.endpoint, {
		method: "POST",
		body: form,
	});
	const result = await uploaded.json();
	if (!uploaded.ok) throw new Error(result.message || "Image upload failed");
	onProgress("Verifying image...");
	const media = await apiRequest(`${base}/complete`, {
		method: "POST",
		body: {
			ticketId: prepared.ticketId,
			uploadToken: prepared.uploadToken,
			fileId: result.fileId,
		},
	});
	return { ...media, uploadToken: prepared.uploadToken };
}
