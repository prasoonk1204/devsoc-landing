import test from "node:test";
import assert from "node:assert/strict";
import { moveImage, uploadImagesInOrder } from "../src/lib/admin-images.ts";

test("drag moves insert at the chosen position without changing the original array", () => {
	const items = ["a", "b", "c", "d"];
	assert.deepEqual(moveImage(items, 0, 2), ["b", "c", "a", "d"]);
	assert.deepEqual(moveImage(items, 3, 0), ["d", "a", "b", "c"]);
	assert.deepEqual(moveImage(items, 1, 2), ["a", "c", "b", "d"]);
	assert.deepEqual(items, ["a", "b", "c", "d"]);
	assert.deepEqual(moveImage(["same", "other", "same"], 0, 1), [
		"other",
		"same",
		"same",
	]);
});
test("invalid and unchanged drag positions keep the list intact", () => {
	const items = ["a", "b"];
	for (const [from, to] of [
		[-1, 0],
		[0, -1],
		[2, 0],
		[0, 2],
		[0.5, 1],
		[0, NaN],
		[1, 1],
	])
		assert.equal(moveImage(items, from, to), items);
	assert.deepEqual(moveImage([], 0, 1), []);
});
test("multiple uploads run sequentially and append in selected order", async () => {
	const files = [
		{ name: "third.jpg" },
		{ name: "first.jpg" },
		{ name: "second.jpg" },
	];
	const appended = ["existing.jpg"];
	const progress = [];
	let active = 0;
	const result = await uploadImagesInOrder(
		files,
		async (file) => {
			assert.equal(++active, 1);
			await Promise.resolve();
			active--;
			return { url: file.name };
		},
		(url) => appended.push(url),
		(position, total) => progress.push([position, total]),
	);
	assert.deepEqual(appended, [
		"existing.jpg",
		"third.jpg",
		"first.jpg",
		"second.jpg",
	]);
	assert.deepEqual(progress, [
		[1, 3],
		[2, 3],
		[3, 3],
	]);
	assert.deepEqual(result, { uploaded: 3, failures: [], failedFiles: [] });
});
test("failed uploads keep successful images and continue through remaining files", async () => {
	const appended = ["existing.jpg"];
	const result = await uploadImagesInOrder(
		[{ name: "one.jpg" }, { name: "bad.jpg" }, { name: "three.jpg" }],
		async (file) => {
			if (file.name === "bad.jpg") throw new Error("Unsupported file");
			return { url: file.name };
		},
		(url) => appended.push(url),
		() => {},
	);
	assert.deepEqual(appended, ["existing.jpg", "one.jpg", "three.jpg"]);
	assert.deepEqual(result, {
		uploaded: 2,
		failures: ["bad.jpg: Unsupported file"],
		failedFiles: [{ name: "bad.jpg" }],
	});
});
test("empty selections and failed uploads do not add blank entries", async () => {
	const appended = [];
	const failed = await uploadImagesInOrder(
		[{ name: "bad.jpg" }],
		async () => {
			throw new Error("Too large");
		},
		(url) => appended.push(url),
		() => {},
	);
	assert.deepEqual(failed, {
		uploaded: 0,
		failures: ["bad.jpg: Too large"],
		failedFiles: [{ name: "bad.jpg" }],
	});
	assert.deepEqual(
		await uploadImagesInOrder(
			[],
			async () => {
				throw new Error("Should not upload");
			},
			(url) => appended.push(url),
			() => {},
		),
		{ uploaded: 0, failures: [], failedFiles: [] },
	);
	assert.deepEqual(appended, []);
});
