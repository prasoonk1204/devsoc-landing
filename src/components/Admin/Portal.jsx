"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	ArrowUpRight,
	LogOut,
	Plus,
	Pencil,
	Trash2,
} from "lucide-react";
import { apiRequest } from "@/lib/upload-image";
import {
	ContentForm,
	blank,
	groupLabels,
	resources,
	icons,
	singular,
	descriptions,
} from "./Fields";
import Toast from "./Toast";
import "./admin.css";

function ConfirmAction({ action, onClose }) {
	const dialog = useRef(null);
	useEffect(() => {
		dialog.current.showModal();
	}, []);
	return (
		<dialog
			ref={dialog}
			className="admin-dialog"
			onClose={onClose}
			aria-labelledby="confirm-title"
		>
			<h2 id="confirm-title">{action.title}</h2>
			<p>{action.message}</p>
			<div className="admin-actions">
				<button autoFocus onClick={() => dialog.current.close()}>
					Cancel
				</button>
				<button
					className="admin-primary"
					onClick={() => {
						dialog.current.close();
						action.run();
					}}
				>
					{action.label}
				</button>
			</div>
		</dialog>
	);
}

export default function AdminPortal() {
	const [kind, setKind] = useState("events");
	const [records, setRecords] = useState([]);
	const [draft, setDraft] = useState(null);
	const [dirty, setDirty] = useState(false);
	const [busy, setBusy] = useState(false);
	const [loading, setLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);
	const [toast, setToast] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [page, setPage] = useState(1);
	const [registrations, setRegistrations] = useState(null);
	const [registrationLoading, setRegistrationLoading] = useState(false);
	const [registrationFailed, setRegistrationFailed] = useState(false);
	const [reload, setReload] = useState(0);
	const heading = useRef(null);
	const router = useRouter();
	const resource = kind === "community" ? "settings" : kind;
	const notify = useCallback((message, error = false) => {
		if (message) setToast({ message, error });
	}, []);
	const closeToast = useCallback(() => setToast(null), []);
	const onError = useCallback((message) => notify(message, true), [notify]);
	const isSettings = resource === "settings";

	async function fetchRecords(signal) {
		const data = await apiRequest(
			kind === "payments"
				? "admin/registrations/events"
				: `admin/content/${resource}`,
			{ signal },
		);
		if (!signal?.aborted) setRecords(data);
		return data;
	}
	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setLoadFailed(false);
		fetchRecords(controller.signal)
			.then((data) => {
				if (!controller.signal.aborted && resource === "settings")
					setDraft(structuredClone(data[0]));
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					onError(error.message);
					setLoadFailed(true);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [kind, reload]);

	useEffect(() => {
		if (kind !== "payments" || !selectedEvent) return;
		const controller = new AbortController();
		setRegistrationLoading(true);
		setRegistrationFailed(false);
		apiRequest(
			`admin/registrations?eventId=${encodeURIComponent(selectedEvent._id)}&eventSlug=${encodeURIComponent(selectedEvent.slug)}&page=${page}`,
			{ signal: controller.signal },
		)
			.then((data) => {
				if (!controller.signal.aborted) setRegistrations(data);
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					onError(error.message);
					setRegistrationFailed(true);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setRegistrationLoading(false);
			});
		return () => controller.abort();
	}, [kind, selectedEvent, page, reload, onError]);
	useEffect(() => {
		if (!dirty) return;
		const warn = (event) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);
	function focusHeading() {
		requestAnimationFrame(() => {
			heading.current?.focus({ preventScroll: true });
			window.scrollTo({ top: 0, behavior: "instant" });
		});
	}
	function leaveDraft(run) {
		const proceed = () => {
			setDirty(false);
			run();
			focusHeading();
		};
		if (dirty)
			setConfirmation({
				title: "Discard unsaved changes?",
				message:
					"Your changes have not been saved. Leave this editor and discard them?",
				label: "Discard changes",
				run: proceed,
			});
		else proceed();
	}
	function navigate(next) {
		if (next === kind) return;
		leaveDraft(() => {
			// Clear the old shape before rendering a different resource's form.
			setDraft(null);
			setToast(null);
			setRecords([]);
			setSelectedEvent(null);
			setRegistrations(null);
			setPage(1);
			setLoading(true);
			setKind(next);
		});
	}
	function edit(record) {
		leaveDraft(() => {
			setToast(null);
			setDraft(structuredClone(record));
		});
	}
	async function save(event) {
		event.preventDefault();
		setBusy(true);
		try {
			const saved = await apiRequest(`admin/content/${resource}/${draft._id}`, {
				method: "PUT",
				body: draft,
			});
			setDraft(saved);
			setDirty(false);
			notify("Changes saved.");
			setRecords((items) =>
				items.some((item) => item._id === saved._id)
					? items.map((item) => (item._id === saved._id ? saved : item))
					: [saved, ...items],
			);
			router.refresh();
		} catch (error) {
			onError(error.message);
		} finally {
			setBusy(false);
		}
	}
	function remove(record) {
		setConfirmation({
			title: `Delete ${singular[kind]}?`,
			message: `“${record.title || record.name}” will be deleted permanently. Uploaded images are retained.`,
			label: "Delete item",
			run: async () => {
				setBusy(true);
				try {
					await apiRequest(`admin/content/${resource}/${record._id}`, {
						method: "DELETE",
					});
					setRecords((items) =>
						items.filter((item) => item._id !== record._id),
					);
					notify("Item deleted.");
					router.refresh();
				} catch (error) {
					onError(error.message);
				} finally {
					setBusy(false);
				}
			},
		});
	}
	async function review(paymentId, status) {
		setBusy(true);
		try {
			await apiRequest("admin/payments/verify", {
				method: "POST",
				body: { paymentId, status },
			});
			setRegistrations((data) => ({
				...data,
				rows: data.rows.map((row) =>
					row.payment?._id === paymentId
						? { ...row, payment: { ...row.payment, status } }
						: row,
				),
			}));
			notify(`Payment ${status}.`);
		} catch (error) {
			onError(error.message);
		} finally {
			setBusy(false);
		}
	}
	function signOut() {
		const run = async () => {
			setBusy(true);
			try {
				await apiRequest("auth/logout", { method: "POST", body: {} });
				router.replace("/admin/login");
				router.refresh();
			} catch (error) {
				onError(error.message);
			} finally {
				setBusy(false);
			}
		};
		if (dirty)
			setConfirmation({
				title: "Sign out without saving?",
				message: "Your unsaved changes will be discarded when you sign out.",
				label: "Sign out",
				run,
			});
		else run();
	}
	const editor = draft && !isSettings;
	return (
		<main className="admin-portal">
			<a className="admin-skip" href="#admin-content">
				Skip to content
			</a>
			<header className="admin-header">
				<div className="admin-header-top">
					<a
						href="/admin"
						className="admin-brand"
						onClick={(event) => {
							event.preventDefault();
							navigate("events");
						}}
					>
						<span className="admin-brand-mark">D.</span>
						<span>
							DevSoc <small>Admin workspace</small>
						</span>
					</a>
					<div className="admin-actions">
						<a
							className="admin-button"
							href="/"
							target="_blank"
							rel="noreferrer"
						>
							Visit website <ArrowUpRight size={16} />
						</a>
						<button disabled={busy} onClick={signOut}>
							<LogOut size={16} />
							Sign out
						</button>
					</div>
				</div>
				<nav aria-label="Admin sections">
					{Object.entries(resources).map(([key, label]) => {
						const Icon = icons[key];
						return (
							<button
								key={key}
								disabled={busy}
								aria-current={kind === key ? "page" : undefined}
								onClick={() => navigate(key)}
							>
								<Icon size={17} />
								{label}
							</button>
						);
					})}
				</nav>
			</header>
			<div id="admin-content" className="admin-content" aria-busy={loading}>
				<div className="admin-page-heading">
					<div>
						<p className="admin-eyebrow">
							Workspace / {resources[kind]}
							{editor ? " / Editor" : selectedEvent ? " / Registrations" : ""}
						</p>
						<h1 ref={heading} tabIndex={-1}>
							{editor
								? `${singular[kind][0].toUpperCase()}${singular[kind].slice(1)} editor`
								: selectedEvent
									? selectedEvent.title
									: resources[kind]}
						</h1>
						<p className="admin-muted">
							{editor
								? "Make your changes below, then save when you’re ready."
								: descriptions[kind]}
						</p>
					</div>
					{!loading && !editor && !isSettings && kind !== "payments" && (
						<button
							className="admin-primary"
							disabled={busy}
							onClick={() => edit(blank(kind))}
						>
							<Plus size={17} />
							New {singular[kind]}
						</button>
					)}
				</div>
				{loading ? (
					<div className="admin-skeleton" role="status">
						<span>Loading {resources[kind].toLowerCase()}...</span>
						<div />
						<div />
						<div />
					</div>
				) : loadFailed ? (
					<div className="admin-empty">
						<h2>Couldn’t load this section</h2>
						<p>Try again to retrieve your latest content.</p>
						<button onClick={() => setReload((value) => value + 1)}>
							Try again
						</button>
					</div>
				) : kind === "payments" && selectedEvent ? (
					<>
						<button
							disabled={busy}
							onClick={() => {
								setSelectedEvent(null);
								setRegistrations(null);
								focusHeading();
							}}
						>
							<ArrowLeft size={16} />
							All events
						</button>
						{registrationLoading ? (
							<p className="admin-empty" role="status">
								Loading registrations...
							</p>
						) : registrationFailed ? (
							<div className="admin-empty">
								<p>Couldn’t load registrations.</p>
								<button onClick={() => setReload((value) => value + 1)}>
									Try again
								</button>
							</div>
						) : (
							registrations && (
								<>
									<div className="admin-table-heading">
										<h2>
											Registrations{" "}
											<span className="admin-badge">{registrations.total}</span>
										</h2>
										<span className="admin-muted">All payment statuses</span>
									</div>
									{registrations.rows.length ? (
										<div
											className="admin-table-wrap"
											tabIndex={0}
											role="region"
											aria-label="Event registrations"
										>
											<table>
												<caption className="sr-only">
													Registrations for {selectedEvent.title}
												</caption>
												<thead>
													<tr>
														<th>Registrant</th>
														<th>Academic details</th>
														<th>Payment</th>
														<th>Status</th>
														<th>Review</th>
													</tr>
												</thead>
												<tbody>
													{registrations.rows.map((row) => {
														const payment = row.payment;
														return (
															<tr key={row._id}>
																<td>
																	<strong>{row.name}</strong>
																	<a href={`mailto:${row.email}`}>
																		{row.email}
																	</a>
																	<span>{row.phone}</span>
																	{row.registeredAt && (
																		<small>
																			{new Date(
																				row.registeredAt,
																			).toLocaleDateString("en-IN")}
																		</small>
																	)}
																	{row.questions && (
																		<details>
																			<summary>Questions</summary>
																			<p>{row.questions}</p>
																		</details>
																	)}
																</td>
																<td>
																	{row.roll || "No roll number"}
																	<span>
																		{[row.department, row.year]
																			.filter(Boolean)
																			.join(" · ")}
																	</span>
																</td>
																<td>
																	{payment ? (
																		<>
																			<strong>INR {payment.amount}</strong>
																			<span className="admin-transaction">
																				{payment.transactionId}
																			</span>
																			{payment.historicalDuplicate && (
																				<p className="admin-warning">
																					Duplicate transaction ID. Check
																					original evidence.
																				</p>
																			)}
																			{payment.receiptUnavailable ? (
																				<p className="admin-warning">
																					Original receipt unavailable. Record
																					retained.
																				</p>
																			) : payment.paymentScreenshotStorageId ? (
																				<a
																					href={`/api/v1/admin/payments/${payment._id}/screenshot`}
																					target="_blank"
																					rel="noreferrer"
																				>
																					View receipt{" "}
																					<ArrowUpRight size={12} />
																				</a>
																			) : (
																				<span>No receipt available</span>
																			)}
																		</>
																	) : (
																		"No payment record"
																	)}
																</td>
																<td>
																	<span
																		className={`admin-badge status-${payment?.status || "none"}`}
																	>
																		{payment?.status || "No payment"}
																	</span>
																</td>
																<td>
																	{payment && (
																		<div className="admin-actions">
																			<button
																				disabled={
																					busy || payment.status === "verified"
																				}
																				onClick={() =>
																					review(payment._id, "verified")
																				}
																			>
																				Verify
																			</button>
																			<button
																				disabled={
																					busy || payment.status === "rejected"
																				}
																				onClick={() =>
																					review(payment._id, "rejected")
																				}
																			>
																				Reject
																			</button>
																		</div>
																	)}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									) : (
										<div className="admin-empty">
											<h2>No registrations yet</h2>
											<p>Registrations will appear here when people sign up.</p>
										</div>
									)}
									<div className="admin-pagination">
										<button
											disabled={page === 1 || busy}
											onClick={() => setPage((value) => value - 1)}
										>
											Previous
										</button>
										<span>
											Page {page} of{" "}
											{Math.max(1, Math.ceil(registrations.total / 50))}
										</span>
										<button
											disabled={page * 50 >= registrations.total || busy}
											onClick={() => setPage((value) => value + 1)}
										>
											Next
										</button>
									</div>
								</>
							)
						)}
					</>
				) : editor || isSettings ? (
					draft ? (
						<>
							{editor && (
								<button
									disabled={busy}
									onClick={() => leaveDraft(() => setDraft(null))}
								>
									<ArrowLeft size={16} />
									Back to {resources[kind].toLowerCase()}
								</button>
							)}
							<form
								onSubmit={save}
								className="admin-editor"
								key={`${kind}:${draft._id}`}
							>
								<fieldset disabled={busy} className="admin-form">
									<ContentForm
										kind={resource}
										section={kind}
										draft={draft}
										setDraft={(value) => {
											setDirty(true);
											setDraft(value);
										}}
										setBusy={setBusy}
										onSuccess={notify}
										onError={onError}
									/>
								</fieldset>
								<div className="admin-save">
									<div>
										<strong>
											{dirty
												? "You have unsaved changes"
												: "Changes are up to date"}
										</strong>
										<p>Removed images remain available in the image editor.</p>
									</div>
									<div className="admin-actions">
										<button
											type="button"
											disabled={busy || !dirty}
											onClick={() =>
												leaveDraft(() =>
													setDraft(
														structuredClone(
															records.find((item) => item._id === draft._id) ||
																blank(kind),
														),
													),
												)
											}
										>
											Discard changes
										</button>
										<button
											className="admin-primary"
											type="submit"
											disabled={busy}
										>
											{busy ? "Working..." : "Save changes"}
										</button>
									</div>
								</div>
							</form>
						</>
					) : (
						<div className="admin-empty">
							Website settings are missing. Initialize the preview database
							first.
						</div>
					)
				) : (
					<>
						<div className="admin-list-heading">
							<span>
								{records.length}{" "}
								{kind === "payments" ? "events" : resources[kind].toLowerCase()}
							</span>
							<span className="admin-muted">
								{kind === "payments"
									? "Select an event to view registrations"
									: "Select Edit to manage an item"}
							</span>
						</div>
						{records.length ? (
							<div
								className={`admin-card-grid ${kind === "members" ? "admin-member-grid" : ""}`}
							>
								{records.map((record) => {
									const image = record.image || record.cover;
									const Icon = icons[kind];
									return (
										<article className="admin-card" key={record._id}>
											{image ? (
												<img
													className={
														kind === "members"
															? "admin-member-photo"
															: "admin-card-banner"
													}
													src={image}
													alt=""
													loading="lazy"
												/>
											) : (
												<div
													className={
														kind === "members"
															? "admin-member-photo admin-card-placeholder"
															: "admin-card-banner admin-card-placeholder"
													}
												>
													<Icon size={28} />
												</div>
											)}
											<div className="admin-card-body">
												<div className="admin-card-meta">
													<span>
														{kind === "members"
															? groupLabels[record.group]
															: record.date || "Date to be confirmed"}
													</span>
													{kind !== "payments" && (
														<span
															className={`admin-badge ${record.published === false || record.active === false ? "" : "status-verified"}`}
														>
															{kind === "members"
																? record.active
																	? "Visible"
																	: "Hidden"
																: record.published
																	? "Published"
																	: "Draft"}
														</span>
													)}
												</div>
												<h2>{record.title || record.name}</h2>
												<p className="admin-muted">
													{kind === "payments"
														? `${record.count} registrations`
														: kind === "members"
															? record.designation
															: record.description ||
																(record.author
																	? `By ${record.author}`
																	: record.slug)}
												</p>
												<div className="admin-card-actions">
													{kind === "payments" ? (
														<button
															className="admin-primary"
															onClick={() => {
																setPage(1);
																setRegistrations(null);
																setRegistrationLoading(true);
																setSelectedEvent(record);
																focusHeading();
															}}
														>
															View registrations <ArrowUpRight size={16} />
														</button>
													) : (
														<>
															<button
																disabled={busy}
																onClick={() => edit(record)}
																aria-label={`Edit ${record.title || record.name}`}
															>
																<Pencil size={15} />
																Edit
															</button>
															<button
																className="admin-danger"
																disabled={busy}
																onClick={() => remove(record)}
																aria-label={`Delete ${record.title || record.name}`}
															>
																<Trash2 size={15} />
																Delete
															</button>
														</>
													)}
												</div>
											</div>
										</article>
									);
								})}
							</div>
						) : (
							<div className="admin-empty">
								<h2>
									No{" "}
									{kind === "payments"
										? "registrations"
										: resources[kind].toLowerCase()}{" "}
									yet
								</h2>
								<p>
									{kind === "payments"
										? "Events appear here after their first registration."
										: `Create your first ${singular[kind]} to get started.`}
								</p>
								<button
									className="admin-primary"
									onClick={() =>
										kind === "payments" ? navigate("events") : edit(blank(kind))
									}
								>
									{kind === "payments"
										? "Go to events"
										: `New ${singular[kind]}`}
								</button>
							</div>
						)}
					</>
				)}
			</div>
			<Toast
				message={toast?.message}
				error={toast?.error}
				onClose={closeToast}
			/>
			{confirmation && (
				<ConfirmAction
					action={confirmation}
					onClose={() => setConfirmation(null)}
				/>
			)}
		</main>
	);
}
