export function dateInputValue(value = "") {
	const parts = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	const iso = parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : value;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
	const date = new Date(`${iso}T00:00:00Z`);
	return !Number.isNaN(date.valueOf()) &&
		date.toISOString().slice(0, 10) === iso
		? iso
		: "";
}
export function timelineDateValue(value: string) {
	const iso = dateInputValue(value);
	return iso ? iso.split("-").reverse().join("-") : "";
}
export function timeInputValue(value = "") {
	const match = value
		.trim()
		.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
	if (!match) return "";
	let hour = Number(match[1]);
	if (Number(match[2]) > 59 || Number(match[3] || 0) > 59) return "";
	if (match[4]) {
		if (hour < 1 || hour > 12) return "";
		hour = (hour % 12) + (match[4].toUpperCase() === "PM" ? 12 : 0);
	} else if (hour > 23) return "";
	return `${String(hour).padStart(2, "0")}:${match[2]}${match[3] ? `:${match[3]}` : ""}`;
}
