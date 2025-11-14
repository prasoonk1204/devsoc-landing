export default function FileUpload({
	label,
	name,
	onChange,
	required = false,
	accept,
	error,
	fileInfo,
	helpText,
}) {
	return (
		<div>
			<label className="mb-2 block text-sm font-medium text-white">
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			<div className="relative">
				<input
					type="file"
					name={name}
					onChange={onChange}
					accept={accept}
					required={required}
					className={`file:bg-accent hover:file:bg-accent/90 focus:ring-accent w-full rounded-lg bg-neutral-800 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black focus:ring-2 focus:outline-none ${
						error ? "border-2 border-red-500" : ""
					}`}
				/>
			</div>
			{helpText && <p className="mt-1 text-xs text-neutral-400">{helpText}</p>}
			{fileInfo && !error && (
				<p className="mt-1 text-sm text-green-400">
					✓ {fileInfo.name} ({fileInfo.size} MB)
				</p>
			)}
			{error && <p className="mt-1 text-sm text-red-400">{error}</p>}
		</div>
	);
}
