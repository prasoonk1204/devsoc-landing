"use client";

import { useState } from "react";
import { Plus, Trash2, Settings } from "lucide-react";

export default function FieldEditor({ field, onUpdate }) {
	const [localField, setLocalField] = useState(field);

	const handleChange = (key, value) => {
		const updated = { ...localField, [key]: value };
		setLocalField(updated);
		onUpdate(updated);
	};

	const handleValidationChange = (key, value) => {
		const updated = {
			...localField,
			validation: { ...localField.validation, [key]: value }
		};
		setLocalField(updated);
		onUpdate(updated);
	};

	const addOption = () => {
		const options = [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`];
		handleChange("options", options);
	};

	const updateOption = (index, value) => {
		const options = [...(localField.options || [])];
		options[index] = value;
		handleChange("options", options);
	};

	const removeOption = (index) => {
		const options = [...(localField.options || [])];
		options.splice(index, 1);
		handleChange("options", options);
	};

	const needsOptions = ["select", "radio", "checkbox"].includes(field.type);

	return (
		<div className="space-y-8">
			{/* Basic Settings */}
			<div>
				<h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
					<Settings className="h-4 w-4 text-orange-500" />
					Basic Settings
				</h4>
				<div className="grid grid-cols-1 gap-4">
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-zinc-300">Field Label</label>
						<input
							type="text"
							value={localField.label}
							onChange={(e) => handleChange("label", e.target.value)}
							className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all duration-200"
							placeholder="e.g. Full Name"
						/>
					</div>
					
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-zinc-300">Field ID</label>
							<input
								type="text"
								value={localField.id}
								onChange={(e) => handleChange("id", e.target.value)}
								className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-sm focus:border-zinc-700 focus:outline-none transition-all duration-200"
								placeholder="field_id"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-zinc-300">Details</label>
							<label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors h-[42px]">
								<input
									type="checkbox"
									checked={localField.required}
									onChange={(e) => handleChange("required", e.target.checked)}
									className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
								/>
								<span className="text-sm font-medium text-zinc-300">Required</span>
							</label>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-sm font-medium text-zinc-300">Placeholder</label>
						<input
							type="text"
							value={localField.placeholder || ""}
							onChange={(e) => handleChange("placeholder", e.target.value)}
							className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none transition-all duration-200"
							placeholder="Enter placeholder text..."
						/>
					</div>
				</div>
			</div>

			{/* Options for select, radio, checkbox */}
			{needsOptions && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
							Options
						</h4>
						<button
							onClick={addOption}
							className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
						>
							<Plus className="h-3 w-3" />
							Add Option
						</button>
					</div>
					<div className="space-y-2">
						{(localField.options || []).map((option, index) => (
							<div key={index} className="flex items-center gap-2 group">
								<span className="text-zinc-600 text-xs font-mono w-4">{index + 1}</span>
								<input
									type="text"
									value={option}
									onChange={(e) => updateOption(index, e.target.value)}
									className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-blue-500/50 focus:outline-none transition-all duration-200"
									placeholder={`Option ${index + 1}`}
								/>
								<button
									onClick={() => removeOption(index)}
									className="p-2 rounded-lg text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
									title="Remove option"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Validation Rules */}
			<div>
				<h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
					<span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
					Validation
				</h4>
				<div className="grid grid-cols-2 gap-4">
					{(field.type === "text" || field.type === "textarea") && (
						<>
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-zinc-500">Min Length</label>
								<input
									type="number"
									value={localField.validation?.minLength || ""}
									onChange={(e) => handleValidationChange("minLength", e.target.value ? Number(e.target.value) : undefined)}
									className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-green-900 focus:outline-none transition-all duration-200"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-zinc-500">Max Length</label>
								<input
									type="number"
									value={localField.validation?.maxLength || ""}
									onChange={(e) => handleValidationChange("maxLength", e.target.value ? Number(e.target.value) : undefined)}
									className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-green-900 focus:outline-none transition-all duration-200"
								/>
							</div>
						</>
					)}
					
					{field.type === "number" && (
						<>
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-zinc-500">Min Value</label>
								<input
									type="number"
									value={localField.validation?.min || ""}
									onChange={(e) => handleValidationChange("min", e.target.value ? Number(e.target.value) : undefined)}
									className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-green-900 focus:outline-none transition-all duration-200"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-zinc-500">Max Value</label>
								<input
									type="number"
									value={localField.validation?.max || ""}
									onChange={(e) => handleValidationChange("max", e.target.value ? Number(e.target.value) : undefined)}
									className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-green-900 focus:outline-none transition-all duration-200"
								/>
							</div>
						</>
					)}

					{field.type === "file" && (
						<>
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-zinc-500">Max Size (MB)</label>
								<input
									type="number"
									value={localField.validation?.maxFileSize ? localField.validation.maxFileSize / (1024 * 1024) : ""}
									onChange={(e) => handleValidationChange("maxFileSize", e.target.value ? Number(e.target.value) * 1024 * 1024 : undefined)}
									className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-green-900 focus:outline-none transition-all duration-200"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-xs font-medium text-zinc-500">File Types</label>
								<input
									type="text"
									value={localField.validation?.fileTypes?.join(", ") || ""}
									onChange={(e) => handleValidationChange("fileTypes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
									placeholder="jpg, png"
									className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-green-900 focus:outline-none transition-all duration-200"
								/>
							</div>
						</>
					)}

					<div className="col-span-2 space-y-1.5">
						<label className="text-xs font-medium text-zinc-500">Regex Pattern</label>
						<input
							type="text"
							value={localField.validation?.pattern || ""}
							onChange={(e) => handleValidationChange("pattern", e.target.value)}
							placeholder="^[A-Za-z]+$"
							className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:border-green-900 focus:outline-none transition-all duration-200"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}