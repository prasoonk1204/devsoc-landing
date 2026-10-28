"use client";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { apiRequest, uploadImage } from "@/lib/upload-image";

export default function ImageField({
	label,
	value,
	onChange,
	ownerKind,
	ownerId,
	slot,
	onError,
	onSuccess,
	setBusy,
	onPendingChange,
	compact = false,
}) {
	const [progress, setProgress] = useState("");
	const [editing, setEditing] = useState(false);
	const [previous, setPrevious] = useState([]);
	const [loadingImages, setLoadingImages] = useState(false);
	const [imageError, setImageError] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [localPreview, setLocalPreview] = useState("");
	useEffect(() => {
		if (!selectedFile) {
			setLocalPreview("");
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setLocalPreview(url);
		onPendingChange(1);
		return () => {
			URL.revokeObjectURL(url);
			onPendingChange(-1);
		};
	}, [selectedFile, onPendingChange]);
	async function edit() {
		setEditing(true);
		setLoadingImages(true);
		setImageError("");
		try {
			setPrevious(
				await apiRequest(
					`admin/media?ownerKind=${ownerKind}&ownerId=${encodeURIComponent(ownerId)}`,
				),
			);
		} catch (error) {
			setImageError(error.message);
			onError(error.message);
		} finally {
			setLoadingImages(false);
		}
	}
	function choose(event) {
		setSelectedFile(event.target.files?.[0] || null);
		event.target.value = "";
	}
	async function uploadSelected() {
		if (!selectedFile) return;
		setBusy(true);
		onError("");
		try {
			const image = await uploadImage(
				selectedFile,
				{ ownerKind, ownerId, slot },
				setProgress,
			);
			onChange(image.url);
			onSuccess("Image uploaded. Save changes to use it.");
			setSelectedFile(null);
			setProgress("");
			setEditing(false);
		} catch (error) {
			onError(error.message);
			setProgress("");
		} finally {
			setBusy(false);
		}
	}
	const preview =
		localPreview || value ? (
			<img
				src={localPreview || value}
				alt={label}
				width={500}
				height={500}
				className="admin-preview"
				loading="lazy"
			/>
		) : (
			<div className="admin-image-empty">No image selected</div>
		);
	return (
		<div className={`admin-image${compact ? " admin-image-compact" : ""}`}>
			{compact && preview}
			<div className="admin-image-heading">
				<strong>{label}</strong>
				<div className="admin-actions">
					<button
						type="button"
						aria-label={
							compact
								? `${editing ? "Close editor for" : "Edit"} ${label.toLowerCase()}`
								: undefined
						}
						onClick={() => {
							if (editing) {
								setSelectedFile(null);
								setEditing(false);
							} else edit();
						}}
					>
						<Pencil size={14} />
						{editing ? "Close" : value ? "Edit" : "Set image"}
					</button>
					{value && (
						<button
							type="button"
							aria-label={compact ? `Delete ${label.toLowerCase()}` : undefined}
							className="admin-danger"
							onClick={() => {
								setSelectedFile(null);
								onChange("");
							}}
						>
							<Trash2 size={14} />
							Delete
						</button>
					)}
				</div>
			</div>
			{!compact && preview}
			{editing && (
				<div className="admin-image-editor">
					<label className="admin-field">
						<span>Choose replacement</span>
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onChange={choose}
						/>
						<small>JPEG, PNG or WebP, up to 10 MB.</small>
					</label>
					{selectedFile && (
						<div className="admin-upload-selection">
							<p>{selectedFile.name}</p>
							<p className="admin-muted">
								Selected locally. Click Upload image before saving.
							</p>
							<div className="admin-actions">
								<button
									type="button"
									className="admin-primary"
									onClick={uploadSelected}
								>
									Upload image
								</button>
								<button type="button" onClick={() => setSelectedFile(null)}>
									Clear selection
								</button>
							</div>
						</div>
					)}
					<p className="admin-muted">
						Or reuse a previous image for this item.
					</p>
					{loadingImages ? (
						<p role="status">Loading previous images...</p>
					) : imageError ? (
						<button type="button" onClick={edit}>
							Retry loading images
						</button>
					) : previous.length ? (
						<div className="admin-image-library">
							{previous.map((image) => (
								<button
									type="button"
									key={image._id}
									aria-label={`Use ${image.name || "previous image"}`}
									aria-pressed={value === image.url}
									onClick={() => {
										setSelectedFile(null);
										onChange(image.url);
										setEditing(false);
									}}
								>
									<img
										src={image.url}
										alt={image.name || "Previous image"}
										loading="lazy"
									/>
								</button>
							))}
						</div>
					) : (
						<p className="admin-muted">No previous images available.</p>
					)}
				</div>
			)}
			{progress && <p role="status">{progress}</p>}
		</div>
	);
}
