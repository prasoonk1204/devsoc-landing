export default function FormSelect({
	label,
	name,
	value,
	onChange,
	required = false,
	options,
	error,
	placeholder = "Select an option",
}) {
	return (
		<div>
			<label className="mb-2 block text-sm font-medium text-white">
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			<select
				name={name}
				value={value}
				onChange={onChange}
				required={required}
				className={`focus:ring-accent w-full rounded-lg bg-neutral-800 px-4 py-3 text-white focus:ring-2 focus:outline-none ${
					error ? "border-2 border-red-500" : ""
				}`}
			>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{error && <p className="mt-1 text-sm text-red-400">{error}</p>}
		</div>
	);
}
