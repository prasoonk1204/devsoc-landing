"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, uploadImage } from "@/lib/upload-image";
import "./admin.css";

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
	settings: "Website & community",
	events: "Events",
	newsletters: "Newsletters",
	members: "Members",
	payments: "Payments",
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
	setBusy,
}) {
	const [progress, setProgress] = useState("");
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
			setProgress("Upload verified. Save changes to use this image.");
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
			<label className="admin-field">
				<span>{label}</span>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={choose}
				/>
				<small>JPEG, PNG or WebP, up to 10 MB.</small>
			</label>
			{value && (
				<>
					<img src={value} alt={label} className="admin-preview" />
					<button type="button" onClick={() => onChange("")}>
						Remove image
					</button>
				</>
			)}
			{progress && <p role="status">{progress}</p>}
		</div>
	);
}
function ContentForm({ kind, draft, setDraft, setBusy, onError }) {
	const update = (key, value) =>
		setDraft((previous) => ({ ...previous, [key]: value }));
	const imageProps = { ownerKind: kind, ownerId: draft._id, onError, setBusy };
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
				{field("whatsapp", "WhatsApp join link", { type: "url" })}
				{field("discord", "Discord join link", { type: "url" })}
				{image("logo", "Logo", "brand")}
				{image("background", "Hero background", "hero")}
				{image("hero", "Astronaut fallback image", "hero")}
				{image("ogImage", "Social sharing banner", "brand")}
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
				{field("maintenance", "Maintenance mode", { type: "checkbox" })}
				{field("eventOnlySlug", "Event-only mode slug", {
					hint: "Leave empty for the full website. Admin remains accessible.",
				})}
			</>
		);
	if (kind === "members")
		return (
			<>
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
			{field("title", "Title", { required: true })}
			{field("slug", "Page slug", {
				required: true,
				hint: "Existing event slugs cannot change once registrations exist.",
			})}
			{field(
				"date",
				kind === "newsletters"
					? "Issue month (YYYY-MM)"
					: "Date (YYYY-MM-DD or TBD)",
				{ required: true },
			)}
			{field("published", "Published", { type: "checkbox" })}
			{kind === "newsletters" ? (
				<>
					{field("author", "Author", { required: true })}
					{image("cover", "Newsletter banner", "banner")}
					{imageList("images", "Inside pages", "pages")}
				</>
			) : (
				<>
					{field("timezone", "Timezone", { required: true })}
					{field("startsAt", "Start time", {
						hint: "Local time in the event timezone, for example 09:00.",
					})}
					{field("endsAt", "End time")}
					{field("location", "Location")}
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
					{image("image", "Event banner", "banner")}
					{imageList("gallery", "Gallery images", "gallery")}
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
export default function AdminPortal() {
	const [kind, setKind] = useState("events");
	const [records, setRecords] = useState([]);
	const [draft, setDraft] = useState(null);
	const [dirty, setDirty] = useState(false);
	const [busy, setBusy] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const router = useRouter();
	async function load(resource = kind, signal) {
		const data = await apiRequest(
			resource === "payments"
				? "admin/payments/pending"
				: `admin/content/${resource}`,
			{ signal },
		);
		setRecords(data);
		if (resource === "settings") setDraft(data[0] || null);
	}
	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setDraft(null);
		setDirty(false);
		setError("");
		setNotice("");
		load(kind, controller.signal)
			.catch((error) => {
				if (error.name !== "AbortError") setError(error.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [kind]);
	function leaveDraft(action) {
		if (!dirty || confirm("Leave this editor? Unsaved changes will be lost.")) {
			setDirty(false);
			action();
		}
	}
	async function save(event) {
		event.preventDefault();
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const saved = await apiRequest(`admin/content/${kind}/${draft._id}`, {
				method: "PUT",
				body: draft,
			});
			await load();
			setDraft(saved);
			setDirty(false);
			setNotice("Changes saved.");
			router.refresh();
		} catch (error) {
			setError(error.message);
		} finally {
			setBusy(false);
		}
	}
	async function remove(record) {
		if (
			!confirm(
				`Delete ${record.title || record.name}? This cannot be undone. Uploaded images are retained.`,
			)
		)
			return;
		setBusy(true);
		setError("");
		try {
			await apiRequest(`admin/content/${kind}/${record._id}`, {
				method: "DELETE",
			});
			setDraft(null);
			await load();
			setNotice("Deleted.");
			router.refresh();
		} catch (error) {
			setError(error.message);
		} finally {
			setBusy(false);
		}
	}
	async function review(paymentId, status) {
		setBusy(true);
		setError("");
		try {
			await apiRequest("admin/payments/verify", {
				method: "POST",
				body: { paymentId, status },
			});
			await load();
			setNotice(`Payment ${status}.`);
		} catch (error) {
			setError(error.message);
		} finally {
			setBusy(false);
		}
	}
	return (
		<main className="admin-portal">
			<header>
				<div>
					<a href="/" target="_blank" rel="noreferrer">
						View website
					</a>
					<h1>DevSoc Admin</h1>
				</div>
				<button
					disabled={busy}
					onClick={async () => {
						try {
							await apiRequest("auth/logout", { method: "POST", body: {} });
							router.replace("/admin/login");
							router.refresh();
						} catch (error) {
							setError(error.message);
						}
					}}
				>
					Sign out
				</button>
			</header>
			<nav aria-label="Admin sections">
				{Object.entries(resources).map(([key, label]) => (
					<button
						key={key}
						disabled={busy || loading}
						aria-current={kind === key ? "page" : undefined}
						onClick={() => {
							if (key !== kind) leaveDraft(() => setKind(key));
						}}
					>
						{label}
					</button>
				))}
			</nav>
			{error && (
				<p role="alert" className="admin-error">
					{error}
				</p>
			)}
			{notice && (
				<p role="status" className="admin-notice">
					{notice}
				</p>
			)}
			{loading ? (
				<p role="status">Loading...</p>
			) : (
				<div className="admin-columns">
					<aside>
						<h2>{resources[kind]}</h2>
						{!["settings", "payments"].includes(kind) && (
							<button
								disabled={busy}
								onClick={() => leaveDraft(() => setDraft(blank(kind)))}
							>
								Create new
							</button>
						)}
						{kind !== "payments" &&
							records.map((record) => (
								<div key={record._id} className="admin-record">
									<button
										disabled={busy}
										onClick={() =>
											leaveDraft(() => setDraft(structuredClone(record)))
										}
									>
										{record.title || record.name || "Website settings"}
									</button>
									<small>
										{record.published === false
											? "Draft"
											: record.group
												? `${groupLabels[record.group]}${record.active ? "" : " (hidden)"}`
												: record.slug || ""}
									</small>
									{kind !== "settings" && (
										<button disabled={busy} onClick={() => remove(record)}>
											Delete
										</button>
									)}
								</div>
							))}
						{!records.length && <p>No records yet.</p>}
					</aside>
					<section>
						{kind === "payments" ? (
							records.map((payment) => (
								<article key={payment._id} className="admin-section">
									<h3>{payment.user?.name || "Unknown registration"}</h3>
									<p>
										{payment.eventTitle} | INR {payment.amount}
									</p>
									<p>{payment.user?.email}</p>
									<p>Transaction: {payment.transactionId}</p>
									{payment.historicalDuplicate && (
										<p className="admin-error">
											Historical duplicate transaction ID. Check original
											payment evidence before reviewing.
										</p>
									)}
									{payment.receiptUnavailable && (
										<p className="admin-error">
											Original screenshot is missing from the legacy source.
											Payment record retained.
										</p>
									)}
									<a
										href={`/api/v1/admin/payments/${payment._id}/screenshot`}
										target="_blank"
										rel="noreferrer"
									>
										View private screenshot
									</a>
									<div className="admin-actions">
										<button
											disabled={busy}
											onClick={() => review(payment._id, "verified")}
										>
											Verify
										</button>
										<button
											disabled={busy}
											onClick={() => review(payment._id, "rejected")}
										>
											Reject
										</button>
									</div>
								</article>
							))
						) : draft ? (
							<form onSubmit={save}>
								<fieldset disabled={busy} className="admin-form">
									<ContentForm
										kind={kind}
										draft={draft}
										setDraft={(value) => {
											setDirty(true);
											setDraft(value);
										}}
										setBusy={setBusy}
										onError={setError}
									/>
								</fieldset>
								<div className="admin-save">
									<button type="submit" disabled={busy}>
										{busy ? "Working..." : "Save changes"}
									</button>
									<p>
										Removing an image detaches it. Original files remain
										available for rollback.
									</p>
								</div>
							</form>
						) : (
							<p>Select an item or create one.</p>
						)}
					</section>
				</div>
			)}
		</main>
	);
}
