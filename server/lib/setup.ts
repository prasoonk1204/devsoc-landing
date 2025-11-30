import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load .env from multiple possible locations
// Try parent directory (when running from server folder)
const parentEnv = resolve(process.cwd(), "../.env");
// Try current directory (when running from root)
const currentEnv = resolve(process.cwd(), ".env");
// Try server/.env (local server config)
const serverEnv = resolve(process.cwd(), "server/.env");

if (existsSync(parentEnv)) {
	config({ path: parentEnv });
} else if (existsSync(currentEnv)) {
	config({ path: currentEnv });
} else if (existsSync(serverEnv)) {
	config({ path: serverEnv });
}

// Also load from server/.env if it exists (for server-specific overrides)
const localServerEnv = resolve(process.cwd(), ".env");
if (existsSync(localServerEnv) && localServerEnv !== parentEnv) {
	config({ path: localServerEnv, override: true });
}
