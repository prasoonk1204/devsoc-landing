import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDb } from "../src/lib/server/db.ts";
import { ensureIndexes, Setting } from "../src/lib/server/models.ts";

export async function initializeDatabase() {
	await connectDb();
	await ensureIndexes();
	await Setting.updateOne(
		{ _id: "site" },
		{ $setOnInsert: { maintenance: false, eventOnlySlug: "", gallery: [] } },
		{ upsert: true },
	);
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	try {
		await initializeDatabase();
		console.log(
			"Database indexes and website settings are ready. Manage content at /admin.",
		);
	} finally {
		await mongoose.disconnect();
	}
}
