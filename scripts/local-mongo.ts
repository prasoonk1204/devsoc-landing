import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";

const databasePath = resolve(".local-mongo");
await mkdir(databasePath, { recursive: true });
const binary =
	process.env.MONGOD_BINARY ||
	"C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe";
const child = spawn(
	binary,
	[
		"--dbpath",
		databasePath,
		"--port",
		"27018",
		"--bind_ip",
		"127.0.0.1",
		"--replSet",
		"devsoc-local",
		"--logpath",
		resolve(databasePath, "mongod.log"),
	],
	{ windowsHide: true, stdio: "ignore" },
);
child.on("error", (error) => {
	console.error(error.message);
	process.exitCode = 1;
});
try {
	await mongoose.connect(
		"mongodb://127.0.0.1:27018/admin?directConnection=true",
		{ serverSelectionTimeoutMS: 15000 },
	);
	const admin = mongoose.connection.db!.admin();
	const hello = await admin.command({ hello: 1 });
	if (!hello.setName)
		await admin.command({
			replSetInitiate: {
				_id: "devsoc-local",
				members: [{ _id: 0, host: "127.0.0.1:27018" }],
			},
		});
	await mongoose.disconnect();
	await mongoose.connect(
		"mongodb://127.0.0.1:27018/admin?replicaSet=devsoc-local",
		{ serverSelectionTimeoutMS: 20000 },
	);
	console.log(
		"Isolated local MongoDB replica set ready on 127.0.0.1:27018. Existing MongoDB service is unchanged.",
	);
	await mongoose.disconnect();
	process.on("SIGINT", () => child.kill());
	process.on("SIGTERM", () => child.kill());
} catch (error) {
	child.kill();
	throw error;
}
