"use client";
import { useEffect, useRef, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	GripVertical,
	Images,
	Upload,
} from "lucide-react";
import { apiRequest, uploadImage } from "@/lib/upload-image";
import { moveImage, uploadImagesInOrder } from "@/lib/admin-images";
import ImageField from "./ImageField";

function SelectedImageCard({ file, index, busy, onRemove }) {
	const [preview, setPreview] = useState("");
	useEffect(() => {
		const url = URL.createObjectURL(file);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);
	return (
		<li>
			{preview && (
				<img
					className="admin-selected-preview"
					src={preview}
					alt={`Selected image ${index + 1}: ${file.name}`}
				/>
			)}
			<span>{file.name}</span>
			<button
				type="button"
				disabled={busy}
				aria-label={`Remove selected file ${index + 1}`}
				onClick={onRemove}
			>
				Remove
			</button>
		</li>
	);
}

export default function ImageCollection({
	label,
	items,
	onChange,
	onAdd,
	ownerKind,
	ownerId,
	slot,
	busy,
	setBusy,
	onError,
	onSuccess,
	maxImages,
	onPendingChange,
}) {
	const input = useRef(null);
	const [progress, setProgress] = useState("");
	const [dragged, setDragged] = useState(null);
	const [dropTarget, setDropTarget] = useState(null);
	const [library, setLibrary] = useState(null);
	const [loadingLibrary, setLoadingLibrary] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const hasSelection = selectedFiles.length > 0;
	useEffect(() => {
		if (!hasSelection) return;
		onPendingChange(1);
		return () => onPendingChange(-1);
	}, [hasSelection, onPendingChange]);
	const pages = slot === "pages";
	const noun = pages ? "pages" : "images";
	const full = items.length + selectedFiles.length >= maxImages;
	function choose(event) {
		const element = event.currentTarget;
		const files = Array.from(element.files || []);
		if (!files.length) return;
		if (items.length + selectedFiles.length + files.length > maxImages) {
			onError(
				`This collection allows up to ${maxImages} ${noun}. You can select ${maxImages - items.length - selectedFiles.length} more.`,
			);
			element.value = "";
			return;
		}
		setSelectedFiles((previous) => [...previous, ...files]);
		element.value = "";
	}
	async function uploadSelected() {
		if (!selectedFiles.length) return;
		setBusy(true);
		try {
			const result = await uploadImagesInOrder(
				selectedFiles,
				(file) => uploadImage(file, { ownerKind, ownerId, slot }),
				onAdd,
				(position, total) =>
					setProgress(`Uploading ${position} of ${total} ${noun}...`),
			);
			setSelectedFiles(result.failedFiles);
			const message = `${result.uploaded} of ${selectedFiles.length} ${noun} uploaded. ${result.uploaded ? "Save changes to use them." : "No images were added."}`;
			if (result.failures.length)
				onError(
					`${message} ${result.failures.slice(0, 3).join("; ")}${result.failures.length > 3 ? `; ${result.failures.length - 3} more failed.` : ""}`,
				);
			else onSuccess(message);
		} finally {
			setProgress("");
			setBusy(false);
		}
	}
	async function openLibrary() {
		if (library !== null) {
			setLibrary(null);
			return;
		}
		setLoadingLibrary(true);
		try {
			setLibrary(
				await apiRequest(
					`admin/media?ownerKind=${ownerKind}&ownerId=${encodeURIComponent(ownerId)}`,
				),
			);
		} catch (error) {
			onError(error.message);
		} finally {
			setLoadingLibrary(false);
		}
	}
	function move(from, to) {
		if (busy || from === null || from === to) return;
		onChange(moveImage(items, from, to));
		setDragged(null);
		setDropTarget(null);
	}
	return (
		<fieldset className="admin-section admin-collection">
			<legend>
				{label} <span className="admin-badge">{items.length}</span>
			</legend>
			<div className="admin-collection-toolbar">
				<p className="admin-muted">
					{pages
						? "Small page previews in reading order."
						: "Masonry preview, matching the public event gallery."}{" "}
					Drag a thumbnail to reorder, or use the arrow buttons.
				</p>
				<div className="admin-actions">
					<button
						type="button"
						disabled={busy || full}
						onClick={() => input.current.click()}
					>
						<Upload size={16} />
						Choose {noun}
					</button>
					<button
						type="button"
						disabled={busy || full || loadingLibrary}
						onClick={openLibrary}
						aria-expanded={library !== null}
					>
						<Images size={16} />
						{loadingLibrary
							? "Loading..."
							: library !== null
								? "Close library"
								: "Previous uploads"}
					</button>
					<input
						ref={input}
						type="file"
						multiple
						hidden
						accept="image/jpeg,image/png,image/webp"
						aria-label={`Choose ${label.toLowerCase()}`}
						onChange={choose}
					/>
				</div>
			</div>
			<p className="admin-muted">
				Select multiple JPEG, PNG or WebP files, up to 10 MB each. New {noun}{" "}
				are appended in selection order.
			</p>
			{hasSelection && (
				<div className="admin-upload-selection">
					<strong>{selectedFiles.length} files selected</strong>
					<p className="admin-muted">
						Nothing is sent to ImageKit until you click Upload selected.
					</p>
					<ul>
						{selectedFiles.map((file, index) => (
							<SelectedImageCard
								key={`${file.name}:${index}`}
								file={file}
								index={index}
								busy={busy}
								onRemove={() =>
									setSelectedFiles((files) =>
										files.filter((_, position) => position !== index),
									)
								}
							/>
						))}
					</ul>
					<div className="admin-actions">
						<button
							type="button"
							className="admin-primary"
							disabled={busy}
							onClick={uploadSelected}
						>
							Upload selected
						</button>
						<button
							type="button"
							disabled={busy}
							onClick={() => setSelectedFiles([])}
						>
							Clear selection
						</button>
					</div>
				</div>
			)}
			{progress && <p role="status">{progress}</p>}
			{library !== null && (
				<div className="admin-collection-library">
					<p className="admin-muted">
						Choose an image to append to this collection.
					</p>
					{library.length ? (
						<div className="admin-image-library">
							{library.map((image) => (
								<button
									key={image._id}
									type="button"
									disabled={busy || full}
									aria-label={`Add ${image.name || "previous image"}`}
									onClick={() => {
										onAdd(image.url);
										setLibrary(null);
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
						<p className="admin-muted">
							No previous uploads available for this item.
						</p>
					)}
				</div>
			)}
			{items.length ? (
				<ol
					className={`admin-collection-grid ${pages ? "admin-page-previews" : "admin-gallery-previews"}`}
					aria-label={`${label} in display order`}
				>
					{items.map((url, index) => (
						<li
							key={`${url}:${items.slice(0, index).filter((entry) => entry === url).length}`}
							className={`admin-collection-item ${dragged === index ? "is-dragging" : ""} ${dropTarget === index && dragged !== index ? "is-drop-target" : ""}`}
							draggable={!busy}
							onDragStart={(event) => {
								if (
									busy ||
									event.target.closest("button, input, select, textarea, label")
								) {
									event.preventDefault();
									return;
								}
								setDragged(index);
								event.dataTransfer.effectAllowed = "move";
								event.dataTransfer.setData("text/plain", String(index));
							}}
							onDragOver={(event) => {
								if (dragged !== null && !busy) {
									event.preventDefault();
									event.dataTransfer.dropEffect = "move";
									setDropTarget(index);
								}
							}}
							onDrop={(event) => {
								event.preventDefault();
								move(dragged, index);
							}}
							onDragEnd={() => {
								setDragged(null);
								setDropTarget(null);
							}}
						>
							<div className="admin-collection-order">
								<span className="admin-badge">
									{pages ? "Page" : "Image"} {index + 1}
								</span>
								<span className="admin-drag-hint" aria-hidden="true">
									<GripVertical size={16} />
									Drag
								</span>
								<div className="admin-actions">
									<button
										type="button"
										disabled={busy || index === 0}
										aria-label={`Move ${pages ? "page" : "image"} ${index + 1} earlier`}
										onClick={() => move(index, index - 1)}
									>
										<ArrowLeft size={15} />
									</button>
									<button
										type="button"
										disabled={busy || index === items.length - 1}
										aria-label={`Move ${pages ? "page" : "image"} ${index + 1} later`}
										onClick={() => move(index, index + 1)}
									>
										<ArrowRight size={15} />
									</button>
								</div>
							</div>
							<ImageField
								compact
								label={`${pages ? "Page" : "Image"} ${index + 1}`}
								value={url}
								ownerKind={ownerKind}
								ownerId={ownerId}
								slot={slot}
								setBusy={setBusy}
								onPendingChange={onPendingChange}
								onError={onError}
								onSuccess={onSuccess}
								onChange={(value) =>
									onChange(
										value
											? items.map((entry, position) =>
													position === index ? value : entry,
												)
											: items.filter((_, position) => position !== index),
									)
								}
							/>
						</li>
					))}
				</ol>
			) : (
				<div className="admin-collection-empty">
					<Images size={28} />
					<p>No {noun} yet. Upload files or choose from previous uploads.</p>
				</div>
			)}
		</fieldset>
	);
}
