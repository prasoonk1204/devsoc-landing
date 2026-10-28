import test from "node:test";
import assert from "node:assert/strict";
import {
	dateInputValue,
	timelineDateValue,
	timeInputValue,
} from "../src/lib/admin-dates.ts";

test("date pickers display ISO and existing day-first dates without timezone shifts", () => {
	assert.equal(dateInputValue("2026-10-28"), "2026-10-28");
	assert.equal(dateInputValue("28-03-2026"), "2026-03-28");
	assert.equal(dateInputValue("29-02-2024"), "2024-02-29");
	for (const value of [
		"",
		"TBD",
		"31-02-2026",
		"2026-02-31",
		"2026",
		"03-2026",
	])
		assert.equal(dateInputValue(value), "");
});
test("new timeline dates retain the day-first format used by the public timeline", () => {
	assert.equal(timelineDateValue("2026-03-28"), "28-03-2026");
	assert.equal(timelineDateValue("28-03-2026"), "28-03-2026");
	assert.equal(timelineDateValue(""), "");
});
test("time pickers handle existing 24-hour and AM/PM values", () => {
	assert.equal(timeInputValue("9:05"), "09:05");
	assert.equal(timeInputValue("09:05:30"), "09:05:30");
	assert.equal(timeInputValue("9:05 PM"), "21:05");
	assert.equal(timeInputValue("12:00 AM"), "00:00");
	assert.equal(timeInputValue("12:00 PM"), "12:00");
	for (const value of [
		"",
		"TBD",
		"24:00",
		"09:60",
		"09:00:60",
		"00:30 AM",
		"13:00 PM",
	])
		assert.equal(timeInputValue(value), "");
});
