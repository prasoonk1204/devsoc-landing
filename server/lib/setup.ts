import { config } from "dotenv";
import { resolve } from "path";

// Load .env from parent directory
config({ path: resolve(process.cwd(), "../.env") });
