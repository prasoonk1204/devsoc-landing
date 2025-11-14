export default function FormTextarea({
	label,
	name,
	value,
	onChange,
	required = false,
	placeholder,
	error,
	rows = 4,
}) {
	return (
		<div>
			<label className="mb-2 block text-sm font-medium text-white">
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			<textarea
				name={name}
				value={value}
				onChange={onChange}
				required={required}
				rows={rows}
				className={`focus:ring-accent w-full resize-none rounded-lg bg-neutral-800 px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:outline-none ${
					error ? "border-2 border-red-500" : ""
				}`}
				placeholder={placeholder}
			/>
			{error && <p className="mt-1 text-sm text-red-400">{error}</p>}
		</div>
	);
}
