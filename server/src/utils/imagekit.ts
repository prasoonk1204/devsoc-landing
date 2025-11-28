import ImageKit from "imagekit";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
  console.warn(
    "ImageKit credentials not configured. Please set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT."
  );
}

export const imagekit = new ImageKit({
  publicKey: publicKey || "",
  privateKey: privateKey || "",
  urlEndpoint: urlEndpoint || "",
});

export const uploadImage = async (
  file: string, // base64
  fileName: string,
  folder: string,
  tags: string[]
) => {
  try {
    const response = await imagekit.upload({
      file,
      fileName,
      folder,
      useUniqueFileName: true,
      tags,
    });
    return {
      fileId: response.fileId,
      url: response.url,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Failed to upload image");
  }
};

export const deleteImage = async (fileId: string) => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("ImageKit delete error:", error);
    // Don't throw, just log
  }
};
