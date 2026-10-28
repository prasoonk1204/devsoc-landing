import mongoose from "mongoose";

const globalDb = globalThis as typeof globalThis & {
	devsocConnection?: Promise<typeof mongoose>;
};
export async function connectDb() {
	if (typeof window !== "undefined")
		throw new Error("Database access is server-only");
	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGODB_URI is not configured");
	if (!globalDb.devsocConnection) {
		globalDb.devsocConnection = mongoose
			.connect(uri, {
				dbName: process.env.MONGODB_DB || "devsoc",
				autoIndex: false,
				autoCreate: false,
				maxPoolSize: 5,
				serverSelectionTimeoutMS: 10000,
			})
			.catch((error) => {
				globalDb.devsocConnection = undefined;
				throw error;
			});
	}
	await globalDb.devsocConnection;
	return mongoose.connection;
}
