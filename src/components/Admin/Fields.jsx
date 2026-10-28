"use client";

import { useState } from "react";
import ImageField from "./ImageField";
import ImageCollection from "./ImageCollection";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
	dateInputValue,
	timeInputValue,
	timelineDateValue,
} from "@/lib/admin-dates";
import "./admin.css";

import {
	CalendarDays,
	Newspaper,
	Users,
	CreditCard,
	Globe,
	MessageCircle,
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
	allowTbd = false,
}) {
	if (type === "date")
		return (
			<div className="admin-field">
				<label className="admin-field">
					<span>{label}</span>
					<input
						type="date"
						value={dateInputValue(value)}
						disabled={allowTbd && value === "TBD"}
						required={required && !(allowTbd && value === "TBD")}
						onChange={(event) => onChange(event.target.value)}
					/>
				</label>
				{allowTbd && (
					<label className="admin-inline-check">
						<input
							type="checkbox"
							checked={value === "TBD"}
							onChange={(event) => onChange(event.target.checked ? "TBD" : "")}
						/>
						Date to be confirmed
					</label>
				)}
				{value && (value !== "TBD" || !allowTbd) && !dateInputValue(value) && (
					<small>Current value: {value}. Pick a date to replace it.</small>
				)}
				{hint && <small>{hint}</small>}
			</div>
		);
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
					value={type === "time" ? timeInputValue(value) : (value ?? "")}
					step={type === "time" ? 1 : undefined}
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
			{type === "time" && value && !timeInputValue(value) && (
				<small>Current value: {value}. Pick a time to replace it.</small>
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
function ContentForm({
	kind,
	section,
	draft,
	setDraft,
	setBusy,
	busy,
	onError,
	onSuccess,
	onPendingChange,
}) {
	const [aboutPreview, setAboutPreview] = useState(false);
	const update = (key, value) =>
		setDraft((previous) => ({ ...previous, [key]: value }));
	const imageProps = {
		ownerKind: kind,
		ownerId: draft._id,
		onError,
		onSuccess,
		setBusy,
		onPendingChange,
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
		<ImageCollection
			{...imageProps}
			label={label}
			slot={slot}
			items={draft[key]}
			busy={busy}
			maxImages={kind === "events" ? 300 : 200}
			onChange={(value) => update(key, value)}
			onAdd={(url) =>
				setDraft((previous) => ({
					...previous,
					[key]: [...previous[key], url],
				}))
			}
		/>
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
	const basics = (
		<fieldset className="admin-section admin-field-grid">
			<legend>
				{kind === "newsletters" ? "Issue details" : "Event basics"}
			</legend>
			{field("title", "Title", { required: true })}
			{field("slug", "Page slug", {
				required: true,
				hint: "Changing this changes the page URL. Registrations stay linked to the event ID.",
			})}
			{field("date", kind === "newsletters" ? "Issue month" : "Event date", {
				required: true,
				type: kind === "newsletters" ? "month" : "date",
				allowTbd: kind === "events",
			})}
			{field("published", "Published", { type: "checkbox" })}
		</fieldset>
	);
	const schedule = (
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
	);
	return (
		<>
			{kind === "events" ? (
				<div className="admin-event-overview">
					<div className="admin-event-details">
						{basics}
						{schedule}
					</div>
					<fieldset className="admin-section admin-banner-panel">
						<legend>Event banner</legend>
						{image("image", "Event banner", "banner")}
					</fieldset>
				</div>
			) : (
				basics
			)}
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
					<fieldset className="admin-section">
						<legend>Event story</legend>
						{field("description", "Description", {
							multiline: true,
							required: true,
						})}
						<div className="admin-markdown-editor">
							<p>About section (Markdown)</p>
							<div
								className="admin-markdown-tabs"
								role="group"
								aria-label="About editor mode"
							>
								<button
									type="button"
									aria-pressed={!aboutPreview}
									onClick={() => setAboutPreview(false)}
								>
									Write
								</button>
								<button
									type="button"
									aria-pressed={aboutPreview}
									onClick={() => setAboutPreview(true)}
								>
									Preview
								</button>
							</div>
							{!aboutPreview &&
								field("detailedDescription", "Markdown text", {
									multiline: true,
									hint: "Use the uploader below for inline images. Raw HTML is disabled.",
								})}
							{aboutPreview && (
								<section
									className="admin-markdown-preview"
									aria-label="About section preview"
								>
									<div className="admin-markdown-body">
										{draft.detailedDescription ? (
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{draft.detailedDescription}
											</ReactMarkdown>
										) : (
											<p className="admin-muted">
												Write Markdown to preview the About section here.
											</p>
										)}
									</div>
								</section>
							)}
						</div>
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
										type={
											key === "date" ? "date" : key === "time" ? "time" : "text"
										}
										multiline={key === "description"}
										value={item[key]}
										onChange={(value) =>
											change({
												...item,
												[key]:
													key === "date" ? timelineDateValue(value) : value,
											})
										}
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
												type={key === "time" ? "time" : "text"}
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
