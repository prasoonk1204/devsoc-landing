import { writeFile } from "node:fs/promises";
import { hashPassword } from "../src/lib/server/auth.ts";

// Synthetic credentials ensure browser verification cannot write to production ImageKit.
const password = "devsoc-local-testing-only";
const hash = await hashPassword(password);
await writeFile(
	".env.local",
	`MONGODB_URI=mongodb://127.0.0.1:27018/?replicaSet=devsoc-local\nMONGODB_DB=devsoc_admin_local\nAPP_ORIGIN=http://localhost:3000\nADMIN_PASSWORD_HASH=${hash}\nIMAGEKIT_PRIVATE_KEY=synthetic-local-private-key\nIMAGEKIT_PUBLIC_KEY=synthetic-local-public-key\nIMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/devsoc\n`,
	{ flag: "wx" },
);
console.log(
	"Created .env.local with isolated MongoDB and synthetic ImageKit credentials. Local password: devsoc-local-testing-only",
);
