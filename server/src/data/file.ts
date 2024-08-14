export default interface File {
	url: string
	thumbnailUrl: string
	projectUrl: string
	sourceUrl: string
	timestamp: number
	title: string
	type: FileType
	extension: string
}

export enum FileType {
	image = "image",
	video = "video",
	audio = "audio",
	unknown = "unknown"
}