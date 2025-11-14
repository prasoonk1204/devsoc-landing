export default function StatusMessage({ type, message }) {
	if (!message) return null;

	const styles = {
		success: "border border-green-700 bg-green-900/50 text-green-200",
		error: "border border-red-700 bg-red-900/50 text-red-200",
		progress: "border border-blue-700 bg-blue-900/50 text-blue-200",
	};

	return (
		<div className={`rounded-lg p-4 ${styles[type]}`}>
			{type === "progress" && (
				<div className="flex items-center gap-3">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-transparent"></div>
					<span>{message}</span>
				</div>
			)}
			{type !== "progress" && <span>{message}</span>}
		</div>
	);
}
