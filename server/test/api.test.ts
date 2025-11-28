import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { api } from "../../src/lib/api"; // This points to frontend api client, but it needs running server.
// Actually, for testing backend, I should test the app instance directly or run the server.
// I'll use the app instance if I exported it, or just fetch if I run the server.

// Let's rely on running the server.
// I'll assume the server is running on localhost:3000 for this test, 
// OR I can import the app and use `app.handle`.

import { Elysia } from "elysia";
// I need to import the app definition. 
// But `index.ts` starts the server immediately.
// I should have separated app definition from listening.
// But for now, I'll just try to hit the endpoints if I can start it.

// Better approach: Create a test that uses `app.handle` if possible.
// But `index.ts` has side effect of listening.

// I will create a simple script that hits the endpoints using `fetch` 
// assuming I start the server in background.

const BASE_URL = "http://localhost:3000";

describe("API Tests", () => {
    it("should return hello", async () => {
        const res = await fetch(`${BASE_URL}/`);
        expect(await res.text()).toBe("Hello Elysia");
    });

    // Add more tests here
});
