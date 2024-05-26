export default interface File {
	url: string
	thumbnailUrl: string
	projectUrl: string
	sourceUrl: string
	timestamp: number
	title: string
	type: "image" | "video" | "audio" | "unknown"
	extension: string
}