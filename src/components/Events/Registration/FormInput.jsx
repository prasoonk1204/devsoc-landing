export default function FormInput({
	label,
	name,
	type = "text",
	value,
	onChange,
	required = false,
	placeholder,
	error,
	className = "",
}) {
	return (
		<div>
			<label className="mb-2 block text-sm font-medium text-white">
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				required={required}
				className={`focus:ring-accent w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-400 focus:ring-2 focus:outline-none sm:px-4 sm:py-3 sm:text-base ${
					error ? "border-2 border-red-500" : ""
				} ${className}`}
				placeholder={placeholder}
			/>
			{error && <p className="mt-1 text-sm text-red-400">{error}</p>}
		</div>
	);
}
