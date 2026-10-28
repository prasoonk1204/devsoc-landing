export function moveImage<T>(items: T[], from: number, to: number): T[] {
	if (
		!Number.isInteger(from) ||
		!Number.isInteger(to) ||
		from < 0 ||
		to < 0 ||
		from >= items.length ||
		to >= items.length ||
		from === to
	)
		return items;
	const next = [...items];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}

export async function uploadImagesInOrder<T extends { name: string }>(
	files: T[],
	upload: (file: T) => Promise<{ url: string }>,
	onUploaded: (url: string) => void,
	onProgress: (position: number, total: number) => void,
) {
	const failures: string[] = [];
	const failedFiles: T[] = [];
	let uploaded = 0;
	for (let index = 0; index < files.length; index++) {
		onProgress(index + 1, files.length);
		try {
			const image = await upload(files[index]);
			onUploaded(image.url);
			uploaded++;
		} catch (error) {
			failedFiles.push(files[index]);
			failures.push(
				`${files[index].name}: ${error instanceof Error ? error.message : "Upload failed"}`,
			);
		}
	}
	return { uploaded, failures, failedFiles };
}
