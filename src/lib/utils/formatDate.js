export const formatNewsletterDate = (dateStr) => {
	const [year, month] = dateStr.split("-");
	const date = new Date(year, month - 1);
	return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};
