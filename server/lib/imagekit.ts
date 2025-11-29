import ImageKit from "imagekit";
import { env } from "./env";

const publicKey = env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const privateKey = env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
	throw new Error("ImageKit credentials are not fully configured");
}

export const imagekit = new ImageKit({
	publicKey,
	privateKey,
	urlEndpoint,
});
