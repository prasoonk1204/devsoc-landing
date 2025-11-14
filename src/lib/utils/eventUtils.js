export function sortEventsByDate(events, order = "desc") {
	return [...events].sort((a, b) => {
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
	const dateObj = new Date(date);
	return dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
