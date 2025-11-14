import ImageKit from "imagekit";
import { env } from "./env";

const imagekit = new ImageKit({
	publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
	privateKey: env.IMAGEKIT_PRIVATE_KEY,
	urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export interface UploadResponse {
	fileId: string;
	name: string;
	url: string;
	thumbnailUrl: string;
	height: number;
	width: number;
	size: number;
	filePath: string;
	fileType: string;
}

export async function uploadToImageKit(
	fileBuffer: Buffer,
	eventSlug: string,
	fileName: string,
): Promise<UploadResponse> {
	try {
		// Convert buffer to base64
		const base64 = fileBuffer.toString("base64");

		// Generate unique filename
		const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

		// Upload to ImageKit in event-specific folder
		const response = await imagekit.upload({
			file: base64,
			fileName: uniqueFileName,
			folder: `/event-registrations/${eventSlug}`,
			useUniqueFileName: true,
			tags: ["event-registration", eventSlug],
		});

		return {
			fileId: response.fileId,
			name: response.name,
			url: response.url,
			thumbnailUrl: response.thumbnailUrl || response.url,
			height: response.height,
			width: response.width,
			size: response.size,
			filePath: response.filePath,
			fileType: response.fileType,
		};
	} catch (error) {
		console.error("ImageKit upload error:", error);
		throw new Error("Failed to upload image to ImageKit");
	}
}
