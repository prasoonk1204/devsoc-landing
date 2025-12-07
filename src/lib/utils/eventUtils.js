export function sortEventsByDate(events, order = "desc") {
	return [...events].sort((a, b) => {
		// TBD events should always be first (latest) when sorting descending
		const isTBD_A = a.date === "TBD";
		const isTBD_B = b.date === "TBD";

		if (isTBD_A && !isTBD_B) return -1;
		if (!isTBD_A && isTBD_B) return 1;
		if (isTBD_A && isTBD_B) return 0;

		const dateA = new Date(a.date);
		const dateB = new Date(b.date);

		if (order === "desc") {
			return dateB - dateA;
		} else {
			return dateA - dateB;
		}
	});
}

export function getLatestEvent(events) {
	const sorted = sortEventsByDate(events, "desc");
	return sorted[0];
}

export function getPreviousEvents(events) {
	const sorted = sortEventsByDate(events, "desc");
	return sorted.slice(1);
}

export function formatEventDate(date) {
	if (date === "TBD") {
		return "To be declared";
	}
	const dateObj = new Date(date);
	return dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
