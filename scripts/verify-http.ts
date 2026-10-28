import assert from "node:assert/strict";

const base = "http://localhost:3000";
let cookie = "";
async function api(path: string, method = "GET", body?: unknown) {
	const response = await fetch(`${base}/api/v1/${path}`, {
		method,
		headers: { origin: base, "content-type": "application/json", cookie },
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
		redirect: "manual",
	});
	return { response, value: await response.json() };
}
const signedIn = await api("auth/login", "POST", {
	password: "devsoc-local-testing-only",
});
assert.equal(signedIn.response.status, 200);
cookie = signedIn.response.headers.get("set-cookie")!.split(";")[0];
const site = (await api("admin/content/settings/site")).value.data;
try {
	for (const route of [
		"/",
		"/about",
		"/events",
		"/newsletter",
		"/events/overclocked-2025",
		"/newsletter/cybersecurity-101",
	]) {
		const response = await fetch(base + route);
		assert.equal(response.status, 200, route);
		assert.ok(!(await response.text()).includes("Application error:"), route);
	}
	assert.equal(
		(await fetch(base + "/api/v1/admin/content/events")).status,
		401,
	);
	assert.equal(
		(await fetch(base + "/admin", { redirect: "manual" })).status,
		307,
	);
	assert.equal(
		(
			await api("admin/content/settings/site", "PUT", {
				...site,
				maintenance: true,
			})
		).response.status,
		200,
	);
	assert.match(await (await fetch(base)).text(), /Back Soon/);
	assert.equal(
		(await fetch(base + "/admin", { headers: { cookie } })).status,
		200,
	);
	assert.equal(
		(
			await api("admin/content/settings/site", "PUT", {
				...site,
				eventOnlySlug: "overclocked-2025",
				maintenance: false,
			})
		).response.status,
		200,
	);
	const restricted = await fetch(base, { redirect: "manual" });
	assert.equal(restricted.status, 307);
	assert.equal(restricted.headers.get("location"), "/events/overclocked-2025");
	assert.equal(
		(await fetch(base + "/admin", { headers: { cookie } })).status,
		200,
	);
	assert.equal((await fetch(base + "/admin/login")).status, 200);
	assert.equal((await api("admin/content/events")).response.status, 200);
	console.log(
		"HTTP checks passed: public routes, anonymous protection, maintenance mode, event-only mode, and admin access.",
	);
} finally {
	assert.equal(
		(await api("admin/content/settings/site", "PUT", site)).response.status,
		200,
	);
	await api("auth/logout", "POST", {});
}
