"use client";
import { useState } from "react";

import { apiRequest, uploadImage } from "@/lib/upload-image";
import "./admin.css";

import {
	CalendarDays,
	Newspaper,
	Users,
	CreditCard,
	Globe,
	MessageCircle,
	Pencil,
	Trash2,
} from "lucide-react";

const groups = [
	"teacherCoordinators",
	"coreCommittee",
	"techTeam",
	"designTeam",
	"managementTeam",
];
const groupLabels = {
	teacherCoordinators: "Teacher coordinators",
	coreCommittee: "Core committee",
	techTeam: "Tech team",
	designTeam: "Design team",
	managementTeam: "Management team",
};
const resources = {
	settings: "Website",
	community: "Community",
	events: "Events",
	newsletters: "Newsletters",
	members: "Members",
	payments: "Payments",
};
const icons = {
	settings: Globe,
	community: MessageCircle,
	events: CalendarDays,
	newsletters: Newspaper,
	members: Users,
	payments: CreditCard,
};
const singular = {
	events: "event",
	newsletters: "newsletter",
	members: "member",
};
const descriptions = {
	settings: "Manage your brand, homepage images, and website availability.",
	community: "Keep your community connected with the right join links.",
	events: "Create experiences, manage details, and control registration.",
	newsletters: "Publish stories and keep your community up to date.",
	members: "Manage the people behind DevSoc.",
	payments: "Browse registrations and review payments by event.",
};
function blank(kind) {
	const _id = crypto.randomUUID();
	if (kind === "events")
		return {
			_id,
			slug: "",
			title: "",
			date: new Date().toISOString().slice(0, 10),
			timezone: "Asia/Kolkata",
			startsAt: "",
			endsAt: "",
			location: "",
			description: "",
			detailedDescription: "",
			image: "",
			gallery: [],
			timeline: [],
			challenges: [],
			published: false,
			registrationMode: "closed",
			externalRegistrationUrl: "",
			payment: null,
			showSnaps: true,
			showProblemStatements: false,
			problemStatementsUnlocked: false,
			feedbackEnabled: false,
		};
	if (kind === "newsletters")
		return {
			_id,
			slug: "",
			title: "",
			author: "DevSoc",
			date: new Date().toISOString().slice(0, 7),
			cover: "",
			images: [],
			published: false,
		};
	return {
		_id,
		name: "",
		designation: "",
		group: "coreCommittee",
		image: "",
		socials: {
			github: "",
			linkedin: "",
			twitter: "",
			instagram: "",
			website: "",
			email: "",
		},
		order: 0,
		active: true,
	};
}
function Field({
	label,
	value,
	onChange,
	type = "text",
	multiline = false,
	required = false,
	options,
	hint,
}) {
	return (
		<label className="admin-field">
			<span>{label}</span>
			{type === "checkbox" ? (
				<input
					type="checkbox"
					checked={Boolean(value)}
					onChange={(event) => onChange(event.target.checked)}
				/>
			) : options ? (
				<select
					value={value || ""}
					onChange={(event) => onChange(event.target.value)}
				>
					{options.map((option) => (
						<option
							key={typeof option === "string" ? option : option.value}
							value={typeof option === "string" ? option : option.value}
						>
							{typeof option === "string" ? option : option.label}
						</option>
					))}
				</select>
			) : multiline ? (
				<textarea
					rows={label.includes("Markdown") ? 12 : 4}
					value={value || ""}
					onChange={(event) => onChange(event.target.value)}
					required={required}
				/>
			) : (
				<input
					type={type}
					value={value ?? ""}
					onChange={(event) =>
						onChange(
							type === "number"
								? Number(event.target.value)
								: event.target.value,
						)
					}
					required={required}
				/>
			)}
			{hint && <small>{hint}</small>}
		</label>
	);
}
function OrderedList({ label, items, onChange, create, children }) {
	function move(index, offset) {
		const next = [...items];
		[next[index], next[index + offset]] = [next[index + offset], next[index]];
		onChange(next);
	}
	return (
		<fieldset className="admin-section">
			<legend>{label}</legend>
			{items.map((item, index) => (
				<div className="admin-list-item" key={index}>
					<div className="admin-actions">
						<span>{index + 1}</span>
						<button
							type="button"
							disabled={index === 0}
							onClick={() => move(index, -1)}
						>
							Move up
						</button>
						<button
							type="button"
							disabled={index === items.length - 1}
							onClick={() => move(index, 1)}
						>
							Move down
						</button>
						<button
							type="button"
							onClick={() => onChange(items.filter((_, i) => i !== index))}
						>
							Remove
						</button>
					</div>
					{children(
						item,
						(value) =>
							onChange(items.map((entry, i) => (i === index ? value : entry))),
						index,
					)}
				</div>
			))}
			<button type="button" onClick={() => onChange([...items, create()])}>
				Add {label.toLowerCase()}
			</button>
		</fieldset>
	);
}
function ImageField({
	label,
	value,
	onChange,
	ownerKind,
	ownerId,
	slot,
	onError,
	onSuccess,
	setBusy,
}) {
	const [progress, setProgress] = useState("");
	const [editing, setEditing] = useState(false);
	const [previous, setPrevious] = useState([]);
	const [loadingImages, setLoadingImages] = useState(false);
	const [imageError, setImageError] = useState("");
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
	async function choose(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		setBusy(true);
		onError("");
		try {
			const image = await uploadImage(
				file,
				{ ownerKind, ownerId, slot },
				setProgress,
			);
			onChange(image.url);
			onSuccess("Image uploaded. Save changes to use it.");
			setProgress("");
			setEditing(false);
		} catch (error) {
			onError(error.message);
			setProgress("");
		} finally {
			setBusy(false);
			event.target.value = "";
		}
	}
	return (
		<div className="admin-image">
			<div className="admin-image-heading">
				<strong>{label}</strong>
				<div className="admin-actions">
					<button
						type="button"
						onClick={() => (editing ? setEditing(false) : edit())}
					>
						<Pencil size={14} />
						{editing ? "Close" : value ? "Edit" : "Set image"}
					</button>
					{value && (
						<button
							type="button"
							className="admin-danger"
							onClick={() => onChange("")}
						>
							<Trash2 size={14} />
							Delete
						</button>
					)}
				</div>
			</div>
			{value ? (
				<img src={value} alt={label} className="admin-preview" />
			) : (
				<div className="admin-image-empty">No image selected</div>
			)}
			{editing && (
				<div className="admin-image-editor">
					<label className="admin-field">
						<span>Upload replacement</span>
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onChange={choose}
						/>
						<small>JPEG, PNG or WebP, up to 10 MB.</small>
					</label>
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
function ContentForm({
	kind,
	section,
	draft,
	setDraft,
	setBusy,
	onError,
	onSuccess,
}) {
	const update = (key, value) =>
		setDraft((previous) => ({ ...previous, [key]: value }));
	const imageProps = {
		ownerKind: kind,
		ownerId: draft._id,
		onError,
		onSuccess,
		setBusy,
	};
	const field = (key, label, extra = {}) => (
		<Field
			key={key}
			label={label}
			value={draft[key]}
			onChange={(value) => update(key, value)}
			{...extra}
		/>
	);
	const image = (key, label, slot) => (
		<ImageField
			{...imageProps}
			label={label}
			slot={slot}
			value={draft[key]}
			onChange={(value) => update(key, value)}
		/>
	);
	const imageList = (key, label, slot) => (
		<OrderedList
			label={label}
			items={draft[key]}
			onChange={(value) => update(key, value)}
			create={() => ""}
		>
			{(value, change, index) => (
				<ImageField
					{...imageProps}
					label={`${label} ${index + 1}`}
					slot={slot}
					value={value}
					onChange={(value) =>
						value
							? change(value)
							: update(
									key,
									draft[key].filter((_, entryIndex) => entryIndex !== index),
								)
					}
				/>
			)}
		</OrderedList>
	);
	if (kind === "settings")
		return (
			<>
				{section === "community" ? (
					<fieldset className="admin-section admin-field-grid">
						<legend>Community links</legend>
						{field("whatsapp", "WhatsApp join link", { type: "url" })}
						{field("discord", "Discord join link", { type: "url" })}
					</fieldset>
				) : (
					<>
						<fieldset className="admin-section admin-field-grid">
							<legend>Brand & homepage</legend>
							{image("logo", "Logo", "brand")}
							{image("background", "Hero background", "hero")}
							{image("hero", "Astronaut fallback image", "hero")}
							{image("ogImage", "Social sharing banner", "brand")}
						</fieldset>
						<OrderedList
							label="Homepage gallery"
							items={draft.gallery}
							onChange={(value) => update("gallery", value)}
							create={() => ({ title: "", image: "" })}
						>
							{(item, change, index) => (
								<>
									<Field
										label="Caption"
										value={item.title}
										onChange={(title) => change({ ...item, title })}
									/>
									<ImageField
										{...imageProps}
										label="Gallery image"
										slot="gallery"
										value={item.image}
										onChange={(value) =>
											value
												? change({ ...item, image: value })
												: update(
														"gallery",
														draft.gallery.filter(
															(_, entryIndex) => entryIndex !== index,
														),
													)
										}
									/>
								</>
							)}
						</OrderedList>
						<fieldset className="admin-section">
							<legend>Website availability</legend>
							{field("maintenance", "Maintenance mode", { type: "checkbox" })}
							{field("eventOnlySlug", "Event-only mode slug", {
								hint: "Leave empty for the full website. Admin remains accessible.",
							})}
						</fieldset>
					</>
				)}
			</>
		);
	if (kind === "members")
		return (
			<>
				<fieldset className="admin-section admin-field-grid">
					<legend>Member details</legend>
					{field("name", "Name", { required: true })}
					{field("designation", "Designation", { required: true })}
					{field("group", "Group", {
						options: groups.map((value) => ({
							value,
							label: groupLabels[value],
						})),
					})}
					{field("order", "Display order", { type: "number" })}
					{field("active", "Visible on About page", { type: "checkbox" })}
					{image("image", "Member photo", "photo")}
				</fieldset>
				<fieldset className="admin-section">
					<legend>Social links</legend>
					{[
						"github",
						"linkedin",
						"twitter",
						"instagram",
						"website",
						"email",
					].map((key) => (
						<Field
							key={key}
							label={key}
							type={key === "email" ? "email" : "url"}
							value={draft.socials[key]}
							onChange={(value) =>
								update("socials", { ...draft.socials, [key]: value })
							}
						/>
					))}
				</fieldset>
			</>
		);
	return (
		<>
			<fieldset className="admin-section admin-field-grid">
				<legend>
					{kind === "newsletters" ? "Issue details" : "Event basics"}
				</legend>
				{field("title", "Title", { required: true })}
				{field("slug", "Page slug", {
					required: true,
					hint: "Changing this changes the page URL. Registrations stay linked to the event ID.",
				})}
				{field(
					"date",
					kind === "newsletters"
						? "Issue month (YYYY-MM)"
						: "Date (YYYY-MM-DD or TBD)",
					{ required: true },
				)}
				{field("published", "Published", { type: "checkbox" })}
			</fieldset>
			{kind === "newsletters" ? (
				<>
					<fieldset className="admin-section">
						<legend>Author & artwork</legend>
						{field("author", "Author", { required: true })}
						{image("cover", "Newsletter banner", "banner")}
					</fieldset>
					{imageList("images", "Inside pages", "pages")}
				</>
			) : (
				<>
					<fieldset className="admin-section admin-field-grid">
						<legend>When & where</legend>
						{field("timezone", "Timezone", { required: true })}
						{field("startsAt", "Start time", {
							type: "time",
							hint: "Local time in the event timezone, for example 09:00.",
						})}
						{field("endsAt", "End time", { type: "time" })}
						{field("location", "Location")}
					</fieldset>
					<fieldset className="admin-section">
						<legend>Event story</legend>
						{field("description", "Description", {
							multiline: true,
							required: true,
						})}
						{field("detailedDescription", "About section (Markdown)", {
							multiline: true,
							hint: "Use the uploader below for inline images. Raw HTML is disabled.",
						})}
						<ImageField
							{...imageProps}
							label="Upload image for About section"
							slot="about"
							value=""
							onChange={(url) => {
								if (url)
									setDraft((previous) => ({
										...previous,
										detailedDescription: `${previous.detailedDescription}\n\n![Event image](${url})`,
									}));
							}}
						/>
					</fieldset>
					<fieldset className="admin-section">
						<legend>Banner</legend>
						{image("image", "Event banner", "banner")}
					</fieldset>
					{imageList("gallery", "Gallery images", "gallery")}
					<fieldset className="admin-section">
						<legend>Registration & payment</legend>
						{field("registrationMode", "Registration", {
							options: [
								{ value: "closed", label: "Closed" },
								{ value: "internal", label: "Internal registration" },
								{ value: "external", label: "External registration link" },
							],
						})}
						{draft.registrationMode === "external" &&
							field("externalRegistrationUrl", "External registration URL", {
								type: "url",
								required: true,
							})}
						<label className="admin-field">
							<span>Configure payment details</span>
							<input
								type="checkbox"
								checked={Boolean(draft.payment)}
								onChange={(event) =>
									update(
										"payment",
										event.target.checked
											? { amount: 50, upiId: "", qrCodeUrl: "" }
											: null,
									)
								}
							/>
						</label>
						{draft.payment && (
							<fieldset className="admin-section">
								<legend>Payment</legend>
								<Field
									label="Amount (INR)"
									type="number"
									value={draft.payment.amount}
									onChange={(amount) =>
										update("payment", { ...draft.payment, amount })
									}
									required
								/>
								<Field
									label="UPI ID"
									value={draft.payment.upiId}
									onChange={(upiId) =>
										update("payment", { ...draft.payment, upiId })
									}
									required
								/>
								<ImageField
									{...imageProps}
									label="Payment QR code"
									slot="payment-qr"
									value={draft.payment.qrCodeUrl}
									onChange={(qrCodeUrl) =>
										update("payment", { ...draft.payment, qrCodeUrl })
									}
								/>
							</fieldset>
						)}
					</fieldset>
					<fieldset className="admin-section admin-field-grid">
						<legend>Page visibility & features</legend>
						{[
							"showSnaps",
							"showProblemStatements",
							"problemStatementsUnlocked",
							"feedbackEnabled",
						].map((key, index) =>
							field(
								key,
								[
									"Show event gallery",
									"Show tracks and problem statements",
									"Unlock problem statements publicly",
									"Enable feedback",
								][index],
								{ type: "checkbox" },
							),
						)}
					</fieldset>
					<OrderedList
						label="Timeline entries"
						items={draft.timeline}
						onChange={(value) => update("timeline", value)}
						create={() => ({
							date: "",
							time: "",
							title: "",
							description: "",
							subEvents: [],
						})}
					>
						{(item, change) => (
							<>
								{["date", "time", "title", "description"].map((key) => (
									<Field
										key={key}
										label={key}
										multiline={key === "description"}
										value={item[key]}
										onChange={(value) => change({ ...item, [key]: value })}
									/>
								))}
								<OrderedList
									label="Sub-events"
									items={item.subEvents}
									onChange={(subEvents) => change({ ...item, subEvents })}
									create={() => ({ time: "", title: "", description: "" })}
								>
									{(sub, updateSub) =>
										["time", "title", "description"].map((key) => (
											<Field
												key={key}
												label={key}
												value={sub[key]}
												onChange={(value) =>
													updateSub({ ...sub, [key]: value })
												}
											/>
										))
									}
								</OrderedList>
							</>
						)}
					</OrderedList>
					<OrderedList
						label="Problem statements"
						items={draft.challenges}
						onChange={(value) => update("challenges", value)}
						create={() => ({
							trackId: "",
							trackName: "",
							challengeNumber: 1,
							slug: "",
							name: "",
							problemStatement: "",
							keyDeliverable: "",
							constraint: "",
						})}
					>
						{(item, change) =>
							[
								"trackId",
								"trackName",
								"challengeNumber",
								"slug",
								"name",
								"problemStatement",
								"keyDeliverable",
								"constraint",
							].map((key) => (
								<Field
									key={key}
									label={key}
									type={key === "challengeNumber" ? "number" : "text"}
									multiline={[
										"problemStatement",
										"keyDeliverable",
										"constraint",
									].includes(key)}
									value={item[key]}
									onChange={(value) => change({ ...item, [key]: value })}
								/>
							))
						}
					</OrderedList>
				</>
			)}
		</>
	);
}

export {
	ContentForm,
	blank,
	groupLabels,
	resources,
	icons,
	singular,
	descriptions,
};
