import { hashPassword } from "../src/lib/server/auth.ts";
let password = "";
for await (const chunk of process.stdin) password += chunk;
console.log(await hashPassword(password.replace(/\r?\n$/, "")));
